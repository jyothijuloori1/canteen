import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Layout } from './components/shared/Layout'
import { Toaster } from './components/ui/toaster'

// Auth Pages
import { Login } from './pages/Login'

// Student Pages
import { Home } from './pages/student/Home'
import { Menu } from './pages/student/Menu'
import { Cart } from './pages/student/Cart'
import { Payment } from './pages/student/Payment'
import { OrderConfirmation } from './pages/student/OrderConfirmation'
import { MyOrders } from './pages/student/MyOrders'
import { Wallet } from './pages/student/Wallet'
import { CompleteProfile } from './pages/student/CompleteProfile'

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { ManageMenu } from './pages/admin/ManageMenu'
import { AdminOrders } from './pages/admin/AdminOrders'
import { AdminTopUps } from './pages/admin/AdminTopUps'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/home" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        user ? (
          <Navigate to={user.role === 'admin' ? '/admin-dashboard' : '/home'} replace />
        ) : (
          <Login />
        )
      } />
      <Route path="/login" element={
        user ? (
          <Navigate to={user.role === 'admin' ? '/admin-dashboard' : '/home'} replace />
        ) : (
          <Login />
        )
      } />

      {/* Student Routes */}
      <Route path="/home" element={
        <ProtectedRoute>
          <Layout>
            <Home />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/menu" element={
        <ProtectedRoute>
          <Layout>
            <Menu />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/cart" element={
        <ProtectedRoute>
          <Layout>
            <Cart />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/payment" element={
        <ProtectedRoute>
          <Layout>
            <Payment />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/order-confirmation/:orderId" element={
        <ProtectedRoute>
          <Layout>
            <OrderConfirmation />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/my-orders" element={
        <ProtectedRoute>
          <Layout>
            <MyOrders />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/wallet" element={
        <ProtectedRoute>
          <Layout>
            <Wallet />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/complete-profile" element={
        <ProtectedRoute>
          <Layout>
            <CompleteProfile />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin-dashboard" element={
        <ProtectedRoute requireAdmin>
          <Layout>
            <AdminDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/manage-menu" element={
        <ProtectedRoute requireAdmin>
          <Layout>
            <ManageMenu />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin-orders" element={
        <ProtectedRoute requireAdmin>
          <Layout>
            <AdminOrders />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin-topups" element={
        <ProtectedRoute requireAdmin>
          <Layout>
            <AdminTopUps />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
