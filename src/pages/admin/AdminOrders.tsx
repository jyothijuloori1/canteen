import { useState } from 'react'
import { motion } from 'framer-motion'
import { QrCode, MapPin, Clock, Package, CheckCircle2, Truck, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { formatCurrency, formatDate } from '@/lib/utils'
import { QRCodeSVG } from 'react-qr-code'

const mockOrders = [
  {
    id: '1',
    orderNumber: 'ORD-1234567890',
    status: 'pending' as const,
    student: { name: 'John Doe', phone: '9876543210' },
    items: [{ name: 'Masala Dosa', quantity: 2 }],
    total: 120,
    paymentMethod: 'wallet' as const,
    createdAt: new Date().toISOString(),
    timeElapsed: 5,
  },
  {
    id: '2',
    orderNumber: 'ORD-0987654321',
    status: 'ready' as const,
    student: { name: 'Jane Smith', phone: '9876543211' },
    items: [{ name: 'Veg Biryani', quantity: 1 }],
    total: 120,
    paymentMethod: 'upi' as const,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    timeElapsed: 30,
  },
]

const statusConfig = {
  scheduled: { label: 'Scheduled', color: 'purple', icon: Clock },
  pending: { label: 'Pending', color: 'yellow', icon: Clock },
  preparing: { label: 'Preparing', color: 'blue', icon: Package },
  ready: { label: 'Ready', color: 'green', icon: CheckCircle2 },
  out_for_delivery: { label: 'Out for Delivery', color: 'orange', icon: Truck },
  delivered: { label: 'Delivered', color: 'green', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'red', icon: X },
}

export function AdminOrders() {
  const [filter, setFilter] = useState('all')
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [deliveryLocation, setDeliveryLocation] = useState('')
  const [eta, setEta] = useState('')

  const filteredOrders = filter === 'all'
    ? mockOrders
    : mockOrders.filter(order => order.status === filter)

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    // In real app, this would update via API
    console.log(`Update order ${orderId} to ${newStatus}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Orders</h1>
          <p className="text-gray-600">View and manage all orders</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter orders" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.map((order, index) => {
          const status = statusConfig[order.status as keyof typeof statusConfig]
          const StatusIcon = status.icon

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-semibold text-lg">{order.orderNumber}</p>
                      <p className="text-xs text-gray-600">{order.timeElapsed} min ago</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge
                        variant={
                          order.status === 'pending' ? 'warning' :
                          order.status === 'delivered' || order.status === 'ready' ? 'success' :
                          order.status === 'cancelled' ? 'destructive' : 'default'
                        }
                      >
                        {status.label}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedOrder(order.id)
                          setQrDialogOpen(true)
                        }}
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {(order.status === 'pending' || order.status === 'preparing') && (
                    <div className="mb-4">
                      <Progress value={order.status === 'pending' ? 30 : 70} />
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    <p className="text-sm">
                      <span className="font-medium">Student:</span> {order.student.name}
                    </p>
                    <p className="text-sm text-gray-600">{order.student.phone}</p>
                    <div className="pt-2 border-t">
                      {order.items.map((item, idx) => (
                        <p key={idx} className="text-sm">
                          {item.name} × {item.quantity}
                        </p>
                      ))}
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-semibold">Total: {formatCurrency(order.total)}</span>
                      <Badge variant="outline">{order.paymentMethod.toUpperCase()}</Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {order.status === 'scheduled' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, 'pending')}
                      >
                        Start Order
                      </Button>
                    )}
                    {order.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, 'preparing')}
                      >
                        Mark Preparing
                      </Button>
                    )}
                    {order.status === 'preparing' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, 'ready')}
                      >
                        Mark Ready
                      </Button>
                    )}
                    {order.status === 'ready' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order.id)
                            setDeliveryDialogOpen(true)
                          }}
                        >
                          Start Delivery
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(order.id, 'delivered')}
                        >
                          Pickup Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          Extend Time
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrder(order.id)
                            setCancelDialogOpen(true)
                          }}
                          className="text-danger"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {order.status === 'out_for_delivery' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, 'delivered')}
                      >
                        Mark Delivered
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order QR Code</DialogTitle>
            <DialogDescription>
              Scan this QR code to verify the order
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-white rounded-lg">
              <QRCodeSVG value={selectedOrder || ''} size={200} />
            </div>
            <div className="text-center">
              <p className="font-semibold">{selectedOrder}</p>
              <p className="text-sm text-gray-600">
                {mockOrders.find(o => o.id === selectedOrder)?.total && 
                  formatCurrency(mockOrders.find(o => o.id === selectedOrder)!.total)
                }
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Start Delivery Dialog */}
      <Dialog open={deliveryDialogOpen} onOpenChange={setDeliveryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Delivery</DialogTitle>
            <DialogDescription>
              Enter delivery details to start tracking
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Delivery Location</Label>
              <Input
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                placeholder="Enter delivery location"
              />
            </div>
            <div>
              <Label>ETA (minutes)</Label>
              <Input
                type="number"
                value={eta}
                onChange={(e) => setEta(e.target.value)}
                placeholder="Estimated delivery time"
              />
            </div>
            <p className="text-sm text-gray-600">
              Customer will see live tracking once delivery starts
            </p>
            <Button
              onClick={() => {
                handleStatusUpdate(selectedOrder || '', 'out_for_delivery')
                setDeliveryDialogOpen(false)
              }}
              className="w-full"
              disabled={!deliveryLocation || !eta}
            >
              Start Delivery
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              This will refund the customer
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Order Details</p>
              <p className="font-semibold">{selectedOrder}</p>
              <p className="text-sm">
                {mockOrders.find(o => o.id === selectedOrder)?.total && 
                  `Total: ${formatCurrency(mockOrders.find(o => o.id === selectedOrder)!.total)}`
                }
              </p>
            </div>
            <div className="p-4 bg-warning/10 rounded-lg">
              <p className="text-sm">
                Refund: {mockOrders.find(o => o.id === selectedOrder)?.paymentMethod === 'wallet' 
                  ? '100% (₹' + (mockOrders.find(o => o.id === selectedOrder)?.total || 0) + ')'
                  : '50% (₹' + Math.floor((mockOrders.find(o => o.id === selectedOrder)?.total || 0) * 0.5) + ')'
                } will be refunded to customer wallet
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setCancelDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleStatusUpdate(selectedOrder || '', 'cancelled')
                  setCancelDialogOpen(false)
                }}
                variant="destructive"
                className="flex-1"
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
