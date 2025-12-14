import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getCart, removeFromCart, updateCartItemQuantity, clearCart, getCartTotal } from '@/lib/cart'
import { formatCurrency, calculateTax } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import { useState, useEffect } from 'react'

export function Cart() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [cartItems, setCartItems] = useState(getCart())

  useEffect(() => {
    const interval = setInterval(() => {
      setCartItems(getCart())
    }, 100)
    return () => clearInterval(interval)
  }, [])

  const subtotal = getCartTotal()
  const tax = calculateTax(subtotal)
  const total = subtotal + tax

  const handleQuantityChange = (itemId: string, change: number) => {
    const item = cartItems.find(i => i.id === itemId)
    if (item) {
      const newQuantity = item.quantity + change
      updateCartItemQuantity(itemId, newQuantity)
      setCartItems(getCart())
    }
  }

  const handleRemove = (itemId: string) => {
    removeFromCart(itemId)
    setCartItems(getCart())
    toast({
      title: 'Item removed',
      description: 'Item has been removed from your cart',
    })
  }

  const handleProceedToPayment = () => {
    if (cartItems.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Add items to your cart first',
        variant: 'destructive',
      })
      return
    }

    if (!user?.profileComplete) {
      navigate('/complete-profile')
    } else {
      navigate('/payment')
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ShoppingBag className="h-24 w-24 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add some delicious items to get started</p>
        <Button asChild className="bg-gradient-to-r from-primary to-primary-600">
          <Link to="/menu">Browse Menu</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
        <p className="text-gray-600">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <p className="text-primary font-semibold mb-3">
                        {formatCurrency(item.price)} each
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className="h-8 w-8"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-semibold w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className="h-8 w-8"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-lg">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(item.id)}
                            className="text-danger hover:text-danger hover:bg-danger/10"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
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
                onClick={handleProceedToPayment}
                className="w-full bg-gradient-to-r from-primary to-primary-600"
                size="lg"
              >
                Proceed to Payment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
