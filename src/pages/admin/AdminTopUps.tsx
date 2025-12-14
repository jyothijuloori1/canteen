import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Clock, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { formatCurrency, formatDate } from '@/lib/utils'

const mockTopUps = [
  {
    id: '1',
    amount: 500,
    student: { name: 'John Doe', email: 'john@example.com' },
    transactionId: 'TXN123456789',
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
    screenshot: 'https://example.com/screenshot.jpg',
  },
  {
    id: '2',
    amount: 1000,
    student: { name: 'Jane Smith', email: 'jane@example.com' },
    transactionId: 'TXN987654321',
    status: 'approved' as const,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '3',
    amount: 200,
    student: { name: 'Bob Johnson', email: 'bob@example.com' },
    transactionId: 'TXN456789123',
    status: 'rejected' as const,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    adminNotes: 'Transaction ID not found in records',
  },
]

const stats = [
  { label: 'Pending', value: mockTopUps.filter(t => t.status === 'pending').length, color: 'yellow' },
  { label: 'Approved', value: mockTopUps.filter(t => t.status === 'approved').length, color: 'green' },
  { label: 'Rejected', value: mockTopUps.filter(t => t.status === 'rejected').length, color: 'red' },
  { label: 'Total', value: mockTopUps.length, color: 'blue' },
]

export function AdminTopUps() {
  const [filter, setFilter] = useState('all')
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedTopUp, setSelectedTopUp] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const filteredTopUps = filter === 'all'
    ? mockTopUps
    : mockTopUps.filter(topUp => topUp.status === filter)

  const handleApprove = () => {
    // In real app, this would update via API
    console.log(`Approve top-up ${selectedTopUp}`)
    setApproveDialogOpen(false)
  }

  const handleReject = () => {
    if (!rejectReason.trim()) {
      return
    }
    // In real app, this would update via API
    console.log(`Reject top-up ${selectedTopUp} with reason: ${rejectReason}`)
    setRejectDialogOpen(false)
    setRejectReason('')
  }

  const selectedTopUpData = mockTopUps.find(t => t.id === selectedTopUp)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Top-Up Requests</h1>
        <p className="text-gray-600">Verify and approve wallet top-up requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`border-${stat.color}-200 bg-${stat.color}-50`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  {stat.color === 'yellow' && <Clock className="h-8 w-8 text-warning" />}
                  {stat.color === 'green' && <CheckCircle2 className="h-8 w-8 text-success" />}
                  {stat.color === 'red' && <XCircle className="h-8 w-8 text-danger" />}
                  {stat.color === 'blue' && <div className="h-8 w-8 rounded-full bg-blue-500" />}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-end">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter requests" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTopUps.map((topUp, index) => (
          <motion.div
            key={topUp.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`
              ${topUp.status === 'pending' ? 'bg-warning/5 border-warning/20' :
                topUp.status === 'approved' ? 'bg-success/5 border-success/20' :
                'bg-danger/5 border-danger/20'}
            `}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-3xl font-bold">{formatCurrency(topUp.amount)}</p>
                  <Badge
                    variant={
                      topUp.status === 'pending' ? 'warning' :
                      topUp.status === 'approved' ? 'success' : 'destructive'
                    }
                  >
                    {topUp.status.charAt(0).toUpperCase() + topUp.status.slice(1)}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Student</p>
                    <p className="font-medium">{topUp.student.name}</p>
                    <p className="text-xs text-gray-500">{topUp.student.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Transaction ID</p>
                    <p className="font-mono text-sm">{topUp.transactionId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{formatDate(topUp.createdAt)}</p>
                  </div>
                </div>

                {topUp.screenshot && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mb-4"
                    onClick={() => window.open(topUp.screenshot, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Screenshot
                  </Button>
                )}

                {topUp.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-success/10 text-success hover:bg-success/20"
                      onClick={() => {
                        setSelectedTopUp(topUp.id)
                        setApproveDialogOpen(true)
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-danger/10 text-danger hover:bg-danger/20"
                      onClick={() => {
                        setSelectedTopUp(topUp.id)
                        setRejectDialogOpen(true)
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}

                {topUp.status === 'rejected' && topUp.adminNotes && (
                  <div className="p-3 bg-danger/10 rounded-lg mt-4">
                    <p className="text-xs font-medium text-danger mb-1">Rejection Reason</p>
                    <p className="text-xs text-gray-700">{topUp.adminNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Top-Up Request</DialogTitle>
            <DialogDescription>
              Verify payment before approving
            </DialogDescription>
          </DialogHeader>
          {selectedTopUpData && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Amount</span>
                  <span className="font-semibold">{formatCurrency(selectedTopUpData.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Transaction ID</span>
                  <span className="font-mono text-sm">{selectedTopUpData.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Student</span>
                  <span className="font-medium">{selectedTopUpData.student.name}</span>
                </div>
              </div>
              <div className="p-4 bg-warning/10 rounded-lg">
                <p className="text-sm text-warning-800 font-medium">
                  ⚠️ Verify payment in your bank/UPI app first before approving
                </p>
              </div>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setApproveDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApprove}
                  className="flex-1 bg-success hover:bg-success/90"
                >
                  Confirm Approval
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Top-Up Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejection
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rejection Reason</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={4}
              />
            </div>
            <p className="text-xs text-gray-600">
              Student will be notified via email
            </p>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setRejectDialogOpen(false)
                  setRejectReason('')
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                variant="destructive"
                className="flex-1"
                disabled={!rejectReason.trim()}
              >
                Reject Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
