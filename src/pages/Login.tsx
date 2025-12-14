import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn, Mail, Lock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/use-toast'

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = await login(email, password)
      if (user) {
        toast({
          title: 'Login successful!',
          description: `Welcome back, ${user.name}!`,
          variant: 'success',
        })
        
        // Redirect based on role
        if (user.role === 'admin') {
          navigate('/admin-dashboard')
        } else if (!user.profileComplete) {
          navigate('/complete-profile')
        } else {
          navigate('/home')
        }
      }
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Invalid email or password',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Quick login buttons for testing
  const handleQuickLogin = async (role: 'student' | 'admin') => {
    setLoading(true)
    try {
      const email = role === 'admin' ? 'admin@canteen.com' : 'student@canteen.com'
      const password = 'password123'
      setEmail(email)
      setPassword(password)
      const user = await login(email, password)
      if (user) {
        toast({
          title: 'Login successful!',
          description: `Welcome, ${user.name}!`,
          variant: 'success',
        })
        
        if (user.role === 'admin') {
          navigate('/admin-dashboard')
        } else if (!user.profileComplete) {
          navigate('/complete-profile')
        } else {
          navigate('/home')
        }
      }
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-gradient-to-br from-primary to-primary-600 p-3">
                <LogIn className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl">Campus Canteen</CardTitle>
            <CardDescription className="text-base">
              Sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary-600"
                size="lg"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-center text-gray-600 mb-4">
                Quick Login (for testing)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleQuickLogin('student')}
                  disabled={loading}
                  className="w-full"
                >
                  Login as Student
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleQuickLogin('admin')}
                  disabled={loading}
                  className="w-full"
                >
                  Login as Admin
                </Button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800 text-center">
                <strong>Demo Credentials:</strong><br />
                Student: student@canteen.com / password123<br />
                Admin: admin@canteen.com / password123
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
