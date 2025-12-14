import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Wallet, Smartphone, DollarSign, Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getCart, getCartTotal, clearCart } from '@/lib/cart'
import { formatCurrency, generateOrderId, calculateTax } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import { QRCodeSVG } from 'react-qr-code'

export function Payment() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'upi' | 'cod'>('wallet')
  const [scheduled, setScheduled] = useState(false)
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [upiDialogOpen, setUpiDialogOpen] = useState(false)
  const [transactionId, setTransactionId] = useState('')

  const cartItems = getCart()
  const subtotal = getCartTotal()
  const tax = calculateTax(subtotal)
  const total = subtotal + tax

  const insufficientBalance = paymentMethod === 'wallet' && (user?.walletBalance || 0) < total

  const timeSlots = []
  for (let hour = 9; hour <= 21; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`)
    if (hour < 21) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
  }

  const handlePayment = () => {
    if (paymentMethod === 'wallet' && insufficientBalance) {
      toast({
        title: 'Insufficient balance',
        description: `Add ₹${Math.ceil(total - (user?.walletBalance || 0))} more to your wallet`,
        variant: 'destructive',
      })
      return
    }

    if (paymentMethod === 'upi' && !transactionId) {
      toast({
        title: 'Transaction ID required',
        description: 'Please enter your UPI transaction ID',
        variant: 'destructive',
      })
      return
    }

    // Create order
    const orderId = generateOrderId()
    clearCart()
    
    toast({
      title: 'Order placed successfully!',
      description: `Your order #${orderId} has been placed`,
      variant: 'success',
    })

    navigate(`/order-confirmation/${orderId}`)
  }

  const handleOpenUpiApp = () => {
    window.open('upi://pay?pa=canteen@upi&pn=Campus%20Canteen&am=' + total + '&cu=INR', '_blank')
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
        <p className="text-gray-600">Complete your order</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Methods */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
                {/* Campus Wallet */}
                <div
                  onClick={() => setPaymentMethod('wallet')}
                  className={`
                    flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${paymentMethod === 'wallet'
                      ? 'border-primary bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <RadioGroupItem value="wallet" id="wallet" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="wallet" className="flex items-center gap-2 cursor-pointer">
                      <Wallet className="h-5 w-5" />
                      <span className="font-semibold">Campus Wallet</span>
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Available Balance: {formatCurrency(user?.walletBalance || 0)}
                    </p>
                    {insufficientBalance && (
                      <p className="text-sm text-danger mt-2 font-medium">
                        Insufficient balance. Add ₹{Math.ceil(total - (user?.walletBalance || 0))} more
                      </p>
                    )}
                  </div>
                </div>

                {/* UPI Payment */}
                <div
                  onClick={() => setPaymentMethod('upi')}
                  className={`
                    flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${paymentMethod === 'upi'
                      ? 'border-primary bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <RadioGroupItem value="upi" id="upi" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="upi" className="flex items-center gap-2 cursor-pointer">
                      <Smartphone className="h-5 w-5" />
                      <span className="font-semibold">UPI Payment</span>
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        setUpiDialogOpen(true)
                      }}
                    >
                      Pay via UPI
                    </Button>
                  </div>
                </div>

                {/* Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`
                    flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${paymentMethod === 'cod'
                      ? 'border-primary bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <RadioGroupItem value="cod" id="cod" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer">
                      <DollarSign className="h-5 w-5" />
                      <span className="font-semibold">Cash on Delivery</span>
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Pay when you collect your order
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Schedule Order */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <CardTitle>Schedule Order</CardTitle>
                </div>
                <Switch
                  checked={scheduled}
                  onCheckedChange={setScheduled}
                />
              </div>
            </CardHeader>
            {scheduled && (
              <CardContent className="space-y-4">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label>Time</Label>
                  <select
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select time</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
                {scheduledDate && scheduledTime && (
                  <p className="text-sm text-success font-medium">
                    Order scheduled for {new Date(scheduledDate).toLocaleDateString()} at {scheduledTime}
                  </p>
                )}
              </CardContent>
            )}
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-6 h-fit">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (GST 5%)</span>
                <span className="font-medium">{formatCurrency(tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
              <Button
                onClick={handlePayment}
                className="w-full bg-gradient-to-r from-primary to-primary-600"
                size="lg"
                disabled={insufficientBalance || (paymentMethod === 'upi' && !transactionId)}
              >
                {paymentMethod === 'wallet' && 'Pay from Wallet'}
                {paymentMethod === 'upi' && 'Confirm Payment'}
                {paymentMethod === 'cod' && 'Place Order (Cash on Delivery)'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* UPI Dialog */}
      <Dialog open={upiDialogOpen} onOpenChange={setUpiDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay via UPI</DialogTitle>
            <DialogDescription>
              Scan the QR code or use the UPI ID to make payment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <QRCodeSVG value={`upi://pay?pa=canteen@upi&pn=Campus%20Canteen&am=${total}&cu=INR`} />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">UPI ID: canteen@upi</p>
              <Button onClick={handleOpenUpiApp} className="w-full mb-4">
                Open UPI App
              </Button>
            </div>
            <div>
              <Label>Transaction ID</Label>
              <Input
                placeholder="Enter your UPI transaction ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </div>
            <Button
              onClick={() => {
                if (transactionId) {
                  setUpiDialogOpen(false)
                  handlePayment()
                }
              }}
              className="w-full"
              disabled={!transactionId}
            >
              Confirm Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
