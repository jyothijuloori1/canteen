import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Package, Clock, Truck, CheckCircle2, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { QRCodeSVG } from 'react-qr-code'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useState, useEffect } from 'react'

const orderStatuses = [
  { id: 'pending', label: 'Pending', icon: Clock, color: 'yellow' },
  { id: 'preparing', label: 'Preparing', icon: Package, color: 'blue' },
  { id: 'ready', label: 'Ready', icon: CheckCircle2, color: 'green' },
  { id: 'delivered', label: 'Delivered', icon: CheckCircle2, color: 'green' },
]

export function OrderConfirmation() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [orderStatus, setOrderStatus] = useState<'pending' | 'preparing' | 'ready' | 'delivered'>('pending')
  const [timeRemaining, setTimeRemaining] = useState(15)

  // Mock order data
  const order = {
    id: orderId || '',
    orderNumber: orderId || '',
    items: [
      { name: 'Masala Dosa', quantity: 2, price: 60 },
      { name: 'Cold Coffee', quantity: 1, price: 50 },
    ],
    total: 170,
    paymentMethod: 'wallet' as const,
    createdAt: new Date().toISOString(),
  }

  useEffect(() => {
    // Simulate order progress
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          if (orderStatus === 'pending') {
            setOrderStatus('preparing')
            return 20
          } else if (orderStatus === 'preparing') {
            setOrderStatus('ready')
            return 10
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [orderStatus])

  const currentStatusIndex = orderStatuses.findIndex(s => s.id === orderStatus)
  const StatusIcon = orderStatuses[currentStatusIndex]?.icon || Clock

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="flex justify-center mb-6"
      >
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-success flex items-center justify-center">
            <Check className="h-12 w-12 text-white" />
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-full bg-success/20"
          />
        </div>
      </motion.div>

      {/* Order Number */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
        <p className="text-lg text-gray-600">Order #{order.orderNumber}</p>
      </div>

      {/* QR Code */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Pickup QR Code</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="p-4 bg-white rounded-lg">
            <QRCodeSVG value={order.orderNumber} size={200} />
          </div>
        </CardContent>
      </Card>

      {/* Progress Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orderStatuses.map((status, index) => {
              const StatusIcon = status.icon
              const isActive = index === currentStatusIndex
              const isCompleted = index < currentStatusIndex
              
              return (
                <div key={status.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`
                      flex items-center justify-center h-10 w-10 rounded-full border-2
                      ${isCompleted
                        ? 'bg-success border-success text-white'
                        : isActive
                        ? `bg-${status.color}-100 border-${status.color}-500 text-${status.color}-700`
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                      }
                    `}>
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <StatusIcon className="h-5 w-5" />
                      )}
                    </div>
                    {index < orderStatuses.length - 1 && (
                      <div className={`
                        w-0.5 h-12 mt-2
                        ${isCompleted ? 'bg-success' : 'bg-gray-200'}
                      `} />
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-semibold ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                          {status.label}
                        </p>
                        {isActive && (
                          <p className="text-sm text-gray-600 mt-1">
                            Estimated time: {timeRemaining} minutes
                          </p>
                        )}
                      </div>
                      {isActive && (
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          <Badge variant={status.color === 'yellow' ? 'warning' : status.color === 'blue' ? 'default' : 'success'}>
                            Active
                          </Badge>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Order Details */}
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-600">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(order.total)}</span>
            </div>
            <div className="mt-2">
              <Badge variant="outline">Payment: {order.paymentMethod.toUpperCase()}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => window.location.reload()}
        >
          Track Order
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          asChild
        >
          <Link to="/my-orders">View My Orders</Link>
        </Button>
        <Button
          className="flex-1 bg-gradient-to-r from-primary to-primary-600"
          asChild
        >
          <Link to="/menu">Back to Menu</Link>
        </Button>
      </div>
    </div>
  )
}
