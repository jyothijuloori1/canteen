import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Gift } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/use-toast'

const years = ['1st', '2nd', '3rd', '4th']
const branches = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'AE', 'BT']

export function CompleteProfile() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    rollNumber: '',
    year: '',
    branch: '',
    phone: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.rollNumber.trim()) {
      newErrors.rollNumber = 'Roll number is required'
    }
    if (!formData.year) {
      newErrors.year = 'Year is required'
    }
    if (!formData.branch) {
      newErrors.branch = 'Branch is required'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }

    // Update user profile
    if (user) {
      const updatedUser = {
        ...user,
        rollNumber: formData.rollNumber,
        year: formData.year,
        branch: formData.branch,
        phone: formData.phone,
        profileComplete: true,
        walletBalance: (user.walletBalance || 0) + 50, // Welcome bonus
      }
      updateUser(updatedUser)
    }

    toast({
      title: 'Profile completed!',
      description: 'You received ₹50 welcome bonus in your wallet',
      variant: 'success',
    })

    navigate('/home')
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-gradient-to-br from-primary to-primary-600 p-3">
                <Gift className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-warning/10 text-warning text-sm font-semibold">
                <Gift className="h-4 w-4" />
                Get ₹50 bonus!
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="rollNumber">Roll Number</Label>
                <Input
                  id="rollNumber"
                  placeholder="Enter your roll number"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  className={errors.rollNumber ? 'border-danger' : ''}
                />
                {errors.rollNumber && (
                  <p className="text-sm text-danger mt-1">{errors.rollNumber}</p>
                )}
              </div>

              <div>
                <Label htmlFor="year">Year</Label>
                <Select
                  value={formData.year}
                  onValueChange={(value) => setFormData({ ...formData, year: value })}
                >
                  <SelectTrigger className={errors.year ? 'border-danger' : ''}>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>{year} Year</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.year && (
                  <p className="text-sm text-danger mt-1">{errors.year}</p>
                )}
              </div>

              <div>
                <Label htmlFor="branch">Branch</Label>
                <Select
                  value={formData.branch}
                  onValueChange={(value) => setFormData({ ...formData, branch: value })}
                >
                  <SelectTrigger className={errors.branch ? 'border-danger' : ''}>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.branch && (
                  <p className="text-sm text-danger mt-1">{errors.branch}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  maxLength={10}
                  className={errors.phone ? 'border-danger' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-danger mt-1">{errors.phone}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary-600"
                size="lg"
              >
                Complete Profile
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
