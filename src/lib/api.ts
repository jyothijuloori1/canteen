// API configuration and utilities
// This will be connected to your backend API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('auth_token')
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }

  return response.json()
}

// Mock data for development (remove when backend is ready)
export const mockMenuItems = [
  {
    id: '1',
    name: 'Masala Dosa',
    description: 'Crispy dosa with spiced potato filling',
    price: 60,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
    category: 'Breakfast' as const,
    isSpecial: true,
    isAvailable: true,
  },
  {
    id: '2',
    name: 'Veg Biryani',
    description: 'Fragrant basmati rice with mixed vegetables',
    price: 120,
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400',
    category: 'Lunch' as const,
    isSpecial: false,
    isAvailable: true,
  },
  {
    id: '3',
    name: 'Samosa',
    description: 'Crispy fried pastry with spiced potato filling',
    price: 25,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
    category: 'Snacks' as const,
    isSpecial: true,
    isAvailable: true,
  },
  {
    id: '4',
    name: 'Cold Coffee',
    description: 'Iced coffee with milk and cream',
    price: 50,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
    category: 'Beverages' as const,
    isSpecial: false,
    isAvailable: true,
  },
  {
    id: '5',
    name: 'Gulab Jamun',
    description: 'Sweet milk dumplings in sugar syrup',
    price: 40,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
    category: 'Desserts' as const,
    isSpecial: false,
    isAvailable: true,
  },
]
