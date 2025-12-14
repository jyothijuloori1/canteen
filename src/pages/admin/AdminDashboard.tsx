import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { IndianRupee, Star, Clock, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

const stats = [
  {
    title: "Today's Revenue",
    value: 12500,
    icon: IndianRupee,
    color: 'orange',
    gradient: 'from-orange-500 to-orange-600',
  },
  {
    title: 'Special Items',
    value: 8,
    icon: Star,
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Pending Orders',
    value: 12,
    icon: Clock,
    color: 'yellow',
    gradient: 'from-yellow-500 to-yellow-600',
  },
  {
    title: 'Total Orders Today',
    value: 45,
    icon: CheckCircle2,
    color: 'green',
    gradient: 'from-green-500 to-green-600',
  },
]

const recentOrders = [
  { id: '1', orderNumber: 'ORD-123', student: 'John Doe', items: 3, amount: 250, status: 'preparing' },
  { id: '2', orderNumber: 'ORD-124', student: 'Jane Smith', items: 2, amount: 180, status: 'ready' },
  { id: '3', orderNumber: 'ORD-125', student: 'Bob Johnson', items: 1, amount: 120, status: 'pending' },
]

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of canteen operations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <Card className={`bg-gradient-to-br ${stat.gradient} text-white border-0 shadow-xl`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-5 w-5 text-white/80" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {stat.title.includes('Revenue') ? formatCurrency(stat.value) : stat.value}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full" size="lg">
              <Link to="/manage-menu">Manage Menu</Link>
            </Button>
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link to="/admin-orders">View Orders</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between pb-4 border-b last:border-0">
                  <div>
                    <p className="font-semibold">{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">{order.student}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(order.amount)}</p>
                    <Badge
                      variant={
                        order.status === 'pending' ? 'warning' :
                        order.status === 'preparing' ? 'default' : 'success'
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button asChild variant="outline" className="w-full mt-4">
              <Link to="/admin-orders">View All Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
