import { ReactNode, useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { 
  Home, Menu, ShoppingCart, Wallet, Package, 
  LogOut, Menu as MenuIcon, X, Bell, User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getInitials, formatCurrency } from '@/lib/utils'
import { getCartItemCount } from '@/lib/cart'
import { motion, AnimatePresence } from 'framer-motion'

interface LayoutProps {
  children: ReactNode
}

const studentNavItems = [
  { path: '/home', label: 'Home', icon: Home },
  { path: '/menu', label: 'Menu', icon: Menu },
  { path: '/cart', label: 'Cart', icon: ShoppingCart },
  { path: '/my-orders', label: 'My Orders', icon: Package },
  { path: '/wallet', label: 'Wallet', icon: Wallet },
]

const adminNavItems = [
  { path: '/admin-dashboard', label: 'Dashboard', icon: Home },
  { path: '/manage-menu', label: 'Manage Menu', icon: Menu },
  { path: '/admin-orders', label: 'Orders', icon: Package },
  { path: '/admin-topups', label: 'Top-Ups', icon: Wallet },
]

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(getCartItemCount())

  useEffect(() => {
    const interval = setInterval(() => {
      setCartCount(getCartItemCount())
    }, 100)
    return () => clearInterval(interval)
  }, [])

  const navItems = user?.role === 'admin' ? adminNavItems : studentNavItems

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-2xl font-bold text-primary">Canteen</h1>
          </div>
          
          {user && (
            <div className="flex items-center gap-3 px-3 py-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-semibold">
                {getInitials(user.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-600 truncate">{user.email}</p>
                {user.role === 'student' && (
                  <p className="text-xs font-semibold text-primary mt-1">
                    {formatCurrency(user.walletBalance)}
                  </p>
                )}
              </div>
            </div>
          )}

          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`
                        flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium
                        ${isActive 
                          ? 'bg-primary text-white' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                      {item.path === '/cart' && cartCount > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                          {cartCount}
                        </Badge>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
            
            <div className="mt-auto pt-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-700 hover:bg-gray-100"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </Button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 flex h-16 items-center gap-x-6 border-b border-gray-200 bg-white px-4 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
        >
          <MenuIcon className="h-6 w-6" />
        </Button>
        
        <div className="flex-1">
          <h1 className="text-xl font-bold text-primary">Canteen</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-danger rounded-full"></span>
          </Button>
          
          {user && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-xs font-semibold">
              {getInitials(user.name)}
            </div>
          )}
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-xl lg:hidden"
            >
              <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
                <h2 className="text-lg font-semibold">Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="flex flex-col h-[calc(100vh-4rem)] overflow-y-auto px-4 py-6">
                {user && (
                  <div className="flex items-center gap-3 px-3 py-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-semibold">
                      {getInitials(user.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-600 truncate">{user.email}</p>
                      {user.role === 'student' && (
                        <p className="text-xs font-semibold text-primary mt-1">
                          {formatCurrency(user.walletBalance)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <nav className="flex-1">
                  <ul className="space-y-1">
                    {navItems.map((item) => {
                      const Icon = item.icon
                      const isActive = location.pathname === item.path
                      return (
                        <li key={item.path}>
                          <Link
                            to={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`
                              flex items-center gap-x-3 rounded-lg px-3 py-3 text-base font-medium
                              ${isActive 
                                ? 'bg-primary text-white' 
                                : 'text-gray-700 hover:bg-gray-100'
                              }
                            `}
                          >
                            <Icon className="h-5 w-5" />
                            {item.label}
                            {item.path === '/cart' && cartCount > 0 && (
                              <Badge variant="secondary" className="ml-auto">
                                {cartCount}
                              </Badge>
                            )}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </nav>

                <div className="mt-auto pt-4 border-t border-gray-200">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-700"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="lg:pl-72">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
