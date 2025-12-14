import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, UtensilsCrossed, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { mockMenuItems } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { addToCart } from '@/lib/cart'
import { useToast } from '@/components/ui/use-toast'

export function Home() {
  const { toast } = useToast()
  const specials = mockMenuItems.filter(item => item.isSpecial).slice(0, 3)

  const handleOrderNow = (item: typeof mockMenuItems[0]) => {
    addToCart({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      category: item.category,
    })
    toast({
      title: 'Added to cart',
      description: `${item.name} has been added to your cart`,
    })
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 p-8 md:p-12 lg:p-16"
      >
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Order Fresh Campus Food
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8">
            Delicious meals delivered fast to your doorstep. Browse our menu and order now!
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary-600">
              <Link to="/menu">Browse Menu</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/my-orders">Track Orders</Link>
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Features Grid */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Zap, title: 'Fast Delivery', description: 'Get your food delivered in minutes' },
            { icon: UtensilsCrossed, title: 'Fresh Food', description: 'Made fresh daily with quality ingredients' },
            { icon: CreditCard, title: 'Easy Payment', description: 'Multiple payment options available' },
          ].map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="rounded-full bg-primary/10 p-4">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Today's Specials */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Today's Specials</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {specials.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0 w-64"
            >
              <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-square relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="bg-primary text-white px-2 py-1 rounded-full text-xs font-semibold">
                      Special
                    </span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">
                      {formatCurrency(item.price)}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleOrderNow(item)}
                      className="bg-gradient-to-r from-primary to-primary-600"
                    >
                      Order Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="text-center py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to order?</h2>
        <p className="text-gray-600 mb-6">Browse our full menu and discover more delicious options</p>
        <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary-600">
          <Link to="/menu">Browse Menu</Link>
        </Button>
      </section>
    </div>
  )
}
