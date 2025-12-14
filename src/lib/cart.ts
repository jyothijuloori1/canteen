export interface CartItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  quantity: number
}

const CART_STORAGE_KEY = 'canteen_cart'

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  const cart = localStorage.getItem(CART_STORAGE_KEY)
  return cart ? JSON.parse(cart) : []
}

export function addToCart(item: Omit<CartItem, 'quantity'>): void {
  const cart = getCart()
  const existingItem = cart.find(cartItem => cartItem.id === item.id)
  
  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cart.push({ ...item, quantity: 1 })
  }
  
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
}

export function removeFromCart(itemId: string): void {
  const cart = getCart().filter(item => item.id !== itemId)
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
}

export function updateCartItemQuantity(itemId: string, quantity: number): void {
  if (quantity <= 0) {
    removeFromCart(itemId)
    return
  }
  
  const cart = getCart()
  const item = cart.find(item => item.id === itemId)
  if (item) {
    item.quantity = quantity
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  }
}

export function clearCart(): void {
  localStorage.removeItem(CART_STORAGE_KEY)
}

export function getCartTotal(): number {
  return getCart().reduce((total, item) => total + (item.price * item.quantity), 0)
}

export function getCartItemCount(): number {
  return getCart().reduce((count, item) => count + item.quantity, 0)
}
