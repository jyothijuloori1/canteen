export interface User {
  id: string
  email: string
  name: string
  role: 'student' | 'admin'
  rollNumber?: string
  year?: string
  branch?: string
  phone?: string
  profileComplete: boolean
  walletBalance: number
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: 'Breakfast' | 'Lunch' | 'Snacks' | 'Beverages' | 'Desserts'
  isSpecial: boolean
  isAvailable: boolean
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: 'wallet' | 'upi' | 'cod'
  status: 'pending' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'scheduled'
  createdAt: string
  scheduledAt?: string
  deliveryLocation?: string
  deliveryETA?: number
  qrCode?: string
}

export interface OrderItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
}

export interface WalletTransaction {
  id: string
  userId: string
  type: 'credit' | 'debit'
  amount: number
  description: string
  balanceAfter: number
  createdAt: string
}

export interface TopUpRequest {
  id: string
  userId: string
  amount: number
  transactionId: string
  screenshot?: string
  status: 'pending' | 'approved' | 'rejected'
  adminNotes?: string
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  read: boolean
  createdAt: string
}
