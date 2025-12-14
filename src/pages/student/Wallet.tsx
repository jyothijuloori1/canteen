import { useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet as WalletIcon, ArrowUp, ArrowDown, QrCode, Upload, Copy, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/context/AuthContext'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { QRCodeSVG } from 'react-qr-code'

// Mock transactions
const mockTransactions = [
  {
    id: '1',
    type: 'credit' as const,
    amount: 500,
    description: 'Top-up approved',
    balanceAfter: 1000,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'debit' as const,
    amount: 120,
    description: 'Order payment',
    balanceAfter: 880,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
]

const mockTopUpRequests = [
  {
    id: '1',
    amount: 500,
    transactionId: 'TXN123456789',
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    amount: 1000,
    transactionId: 'TXN987654321',
    status: 'approved' as const,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
]

export function Wallet() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const [addMoneyDialogOpen, setAddMoneyDialogOpen] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [amount, setAmount] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [copied, setCopied] = useState(false)

  const balance = user?.walletBalance || 0
  const credits = mockTransactions.filter(t => t.type === 'credit').length
  const debits = mockTransactions.filter(t => t.type === 'debit').length
  const pendingRequests = mockTopUpRequests.filter(r => r.status === 'pending').length

  const handleAddMoney = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      })
      return
    }

    // In real app, this would submit to backend
    toast({
      title: 'Request submitted',
      description: 'Your top-up request has been submitted. Admin will verify within 30 minutes.',
      variant: 'success',
    })
    setAddMoneyDialogOpen(false)
    setAmount('')
    setTransactionId('')
    setScreenshot(null)
  }

  const handleCopyUPI = () => {
    navigator.clipboard.writeText('canteen@upi')
    setCopied(true)
    toast({
      title: 'Copied!',
      description: 'UPI ID copied to clipboard',
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenUPI = () => {
    window.open('upi://pay?pa=canteen@upi&pn=Campus%20Canteen&am=' + amount + '&cu=INR', '_blank')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
        <p className="text-gray-600">Manage your wallet balance and transactions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <WalletIcon className="h-8 w-8" />
                  <CardTitle className="text-white">Available Balance</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowQR(!showQR)}
                  className="text-white hover:bg-white/20"
                >
                  <QrCode className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold mb-6">{formatCurrency(balance)}</p>
              
              {showQR && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4 p-4 bg-white/10 rounded-lg"
                >
                  <div className="flex justify-center mb-2">
                    <div className="p-2 bg-white rounded">
                      <QRCodeSVG value={`wallet:${user?.id}`} size={150} />
                    </div>
                  </div>
                  <p className="text-center text-sm">Scan to view wallet</p>
                </motion.div>
              )}

              <div className="space-y-3">
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                />
                <div className="flex gap-2">
                  {[100, 200, 500, 1000].map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(quickAmount.toString())}
                      className="flex-1 bg-white/10 border-white/30 text-white hover:bg-white/20"
                    >
                      ₹{quickAmount}
                    </Button>
                  ))}
                </div>
                <Button
                  onClick={() => setAddMoneyDialogOpen(true)}
                  className="w-full bg-white text-primary hover:bg-gray-100"
                >
                  Add Money
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUp className="h-5 w-5 text-success" />
                <span className="text-sm text-gray-600">Credits</span>
              </div>
              <span className="font-semibold">{credits}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowDown className="h-5 w-5 text-danger" />
                <span className="text-sm text-gray-600">Debits</span>
              </div>
              <span className="font-semibold">{debits}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <WalletIcon className="h-5 w-5 text-warning" />
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <span className="font-semibold">{pendingRequests}</span>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-sm font-semibold">Total Transactions</span>
              <span className="font-semibold">{mockTransactions.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="topups">Top-Up Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          {mockTransactions.map((transaction) => (
            <Card key={transaction.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`
                      flex items-center justify-center h-10 w-10 rounded-full
                      ${transaction.type === 'credit' ? 'bg-success/10' : 'bg-danger/10'}
                    `}>
                      {transaction.type === 'credit' ? (
                        <ArrowUp className="h-5 w-5 text-success" />
                      ) : (
                        <ArrowDown className="h-5 w-5 text-danger" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-600">{formatDate(transaction.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`
                      font-semibold
                      ${transaction.type === 'credit' ? 'text-success' : 'text-danger'}
                    `}>
                      {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-gray-600">Balance: {formatCurrency(transaction.balanceAfter)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="topups" className="space-y-4">
          {mockTopUpRequests.map((request) => (
            <Card
              key={request.id}
              className={`
                ${request.status === 'pending' ? 'bg-warning/5 border-warning/20' :
                  request.status === 'approved' ? 'bg-success/5 border-success/20' :
                  'bg-danger/5 border-danger/20'}
              `}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(request.amount)}</p>
                    <p className="text-sm text-gray-600">TXN: {request.transactionId}</p>
                  </div>
                  <Badge
                    variant={
                      request.status === 'pending' ? 'warning' :
                      request.status === 'approved' ? 'success' : 'destructive'
                    }
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">{formatDate(request.createdAt)}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Add Money Dialog */}
      <Dialog open={addMoneyDialogOpen} onOpenChange={setAddMoneyDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Money to Wallet</DialogTitle>
            <DialogDescription>
              Pay via UPI and submit your transaction details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <div className="flex justify-center">
                <div className="p-3 bg-white rounded">
                  <QRCodeSVG value={`upi://pay?pa=canteen@upi&pn=Campus%20Canteen&am=${amount || 0}&cu=INR`} size={150} />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-medium">UPI ID: canteen@upi</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyUPI}
                    className="flex-1"
                  >
                    {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                    {copied ? 'Copied' : 'Copy UPI ID'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleOpenUPI}
                    className="flex-1"
                  >
                    Open UPI App
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label>Transaction ID</Label>
              <Input
                placeholder="Enter UPI transaction ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </div>

            <div>
              <Label>Screenshot (Optional)</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
              />
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800">
                Admin will verify and credit your wallet within 30 minutes
              </p>
            </div>

            <Button
              onClick={handleAddMoney}
              className="w-full"
              disabled={!amount || !transactionId}
            >
              Submit Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
