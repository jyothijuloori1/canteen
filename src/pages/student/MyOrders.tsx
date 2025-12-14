import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, Clock, CheckCircle2, XCircle, Truck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { formatCurrency, formatDate } from '@/lib/utils'

const statusConfig = {
  pending: { label: 'Pending', color: 'yellow', icon: Clock },
  preparing: { label: 'Preparing', color: 'blue', icon: Clock },
  ready: { label: 'Ready', color: 'green', icon: CheckCircle2 },
  out_for_delivery: { label: 'Out for Delivery', color: 'orange', icon: Truck },
  delivered: { label: 'Delivered', color: 'green', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'red', icon: XCircle },
}

// Mock orders data
const mockOrders = [
  {
    id: '1',
    orderNumber: 'ORD-1234567890',
    status: 'preparing' as const,
    items: [{ name: 'Masala Dosa', quantity: 2 }],
    total: 120,
    paymentMethod: 'wallet' as const,
    createdAt: new Date().toISOString(),
    estimatedTime: 15,
  },
  {
    id: '2',
    orderNumber: 'ORD-0987654321',
    status: 'delivered' as const,
    items: [{ name: 'Veg Biryani', quantity: 1 }, { name: 'Cold Coffee', quantity: 1 }],
    total: 170,
    paymentMethod: 'upi' as const,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
]

export function MyOrders() {
  const [filter, setFilter] = useState<string>('all')

  const filteredOrders = filter === 'all'
    ? mockOrders
    : mockOrders.filter(order => order.status === filter)

  if (filteredOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Package className="h-24 w-24 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders found</h2>
        <p className="text-gray-600 mb-6">Start ordering to see your orders here</p>
        <Button asChild className="bg-gradient-to-r from-primary to-primary-600">
          <Link to="/menu">Start Ordering</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600">View and track your orders</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter orders" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
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
          const status = statusConfig[order.status]
          const StatusIcon = status.icon
          const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <Card className="h-full hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Order #{order.orderNumber.slice(-8)}</p>
                      <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>
                    <Badge
                      variant={
                        order.status === 'pending' ? 'warning' :
                        order.status === 'delivered' || order.status === 'ready' ? 'success' :
                        order.status === 'cancelled' ? 'destructive' : 'default'
                      }
                      className="flex items-center gap-1"
                    >
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </div>

                  {(order.status === 'pending' || order.status === 'preparing') && order.estimatedTime && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Estimated time</span>
                        <span>{order.estimatedTime} min</span>
                      </div>
                      <Progress value={(15 - order.estimatedTime) / 15 * 100} />
                    </div>
                  )}

                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'} • {formatCurrency(order.total)}
                    </p>
                    <Badge variant="outline" className="mt-2">
                      {order.paymentMethod.toUpperCase()}
                    </Badge>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <Link to={`/order-confirmation/${order.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
