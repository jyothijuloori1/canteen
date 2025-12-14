# Backend Usage Guide

## Frontend Integration

### Import the Client

```typescript
import { canteen } from '@/api/canteenClient';
```

### Authentication

```typescript
// Register new user
const { token, user } = await canteen.auth.register(
  'user@example.com',
  'password123',
  'John Doe'
);

// Login
const { token, user } = await canteen.auth.login(
  'user@example.com',
  'password123'
);

// Get current user
const user = await canteen.auth.me();

// Update current user
const updated = await canteen.auth.updateMe({
  wallet_balance: 500,
  profile_complete: true
});

// Check if authenticated
const isAuth = await canteen.auth.isAuthenticated();

// Logout
canteen.auth.logout();

// Redirect to login
canteen.auth.redirectToLogin('/payment');
```

### Entity Operations

#### List All Items
```typescript
// Get all menu items
const items = await canteen.entities.MenuItem.list();

// Get with sorting (descending by created_date)
const recent = await canteen.entities.MenuItem.list('-created_date', 20);

// Get with filtering
const lunchItems = await canteen.entities.MenuItem.filter({
  category: 'Lunch',
  is_available: true
});

// Get user's orders
const myOrders = await canteen.entities.Order.filter({
  created_by: user.email
}, '-created_date');
```

#### Get Single Item
```typescript
const item = await canteen.entities.MenuItem.get(itemId);
```

#### Create Item
```typescript
const order = await canteen.entities.Order.create({
  order_number: 'ORD-001',
  items: [
    { name: 'Burger', quantity: 2, price: 99.99 }
  ],
  total_amount: 199.98,
  payment_method: 'Campus Wallet'
});
```

#### Bulk Create
```typescript
const transactions = await canteen.entities.WalletTransaction.bulkCreate([
  { amount: 100, type: 'credit', description: 'Top-up', balance_after: 100 },
  { amount: 50, type: 'debit', description: 'Order payment', balance_after: 50 }
]);
```

#### Update Item
```typescript
const updated = await canteen.entities.Order.update(orderId, {
  status: 'Preparing'
});
```

#### Delete Item
```typescript
await canteen.entities.MenuItem.delete(itemId);
```

#### Get Schema
```typescript
const schema = await canteen.entities.MenuItem.schema();
```

### Integration Services

#### Send Email
```typescript
await canteen.integrations.Core.sendEmail({
  to: 'student@college.edu',
  subject: 'Order Confirmed',
  body: 'Your order #123 is ready!',
  html: '<h1>Order Confirmed</h1><p>Your order #123 is ready!</p>'
});
```

#### Upload File
```typescript
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const result = await canteen.integrations.Core.uploadFile(file);
// Returns: { success: true, file_url: 'http://...', filename: '...' }
```

## Example: Place Order Flow

```typescript
import { canteen } from '@/api/canteenClient';

async function placeOrder(cartItems: CartItem[], paymentMethod: string) {
  // 1. Get current user
  const user = await canteen.auth.me();
  
  // 2. Check wallet balance if using wallet
  if (paymentMethod === 'Campus Wallet') {
    const total = calculateTotal(cartItems);
    if (user.wallet_balance < total) {
      throw new Error('Insufficient balance');
    }
  }
  
  // 3. Create order
  const order = await canteen.entities.Order.create({
    order_number: `ORD-${Date.now()}`,
    items: cartItems,
    total_amount: calculateTotal(cartItems),
    payment_method: paymentMethod,
    status: 'Pending'
  });
  
  // 4. If wallet payment, deduct balance
  if (paymentMethod === 'Campus Wallet') {
    const newBalance = user.wallet_balance - order.total_amount;
    await canteen.auth.updateMe({ wallet_balance: newBalance });
    
    // 5. Log transaction
    await canteen.entities.WalletTransaction.create({
      amount: order.total_amount,
      type: 'debit',
      description: `Order ${order.order_number}`,
      balance_after: newBalance
    });
  }
  
  // 6. Send email notification
  await canteen.integrations.Core.sendEmail({
    to: user.email,
    subject: 'Order Confirmed',
    body: `Your order ${order.order_number} has been placed successfully!`
  });
  
  // 7. Notify admins
  const admins = await canteen.entities.User.filter({ role: 'admin' });
  for (const admin of admins) {
    await canteen.integrations.Core.sendEmail({
      to: admin.email,
      subject: 'New Order',
      body: `New order ${order.order_number} has been placed.`
    });
  }
  
  return order;
}
```

## Example: Admin Approve Top-Up

```typescript
async function approveTopUp(requestId: string) {
  // 1. Get request
  const request = await canteen.entities.TopUpRequest.get(requestId);
  
  // 2. Update status
  await canteen.entities.TopUpRequest.update(requestId, {
    status: 'approved'
  });
  
  // 3. Get student
  const students = await canteen.entities.User.filter({
    email: request.created_by
  });
  const student = students[0];
  
  // 4. Update wallet balance
  const newBalance = student.wallet_balance + request.amount;
  await canteen.entities.User.update(student.id, {
    wallet_balance: newBalance
  });
  
  // 5. Create transaction
  await canteen.entities.WalletTransaction.create({
    amount: request.amount,
    type: 'credit',
    description: `Top-up approved - ${request.transaction_id}`,
    balance_after: newBalance
  });
  
  // 6. Notify student
  await canteen.integrations.Core.sendEmail({
    to: student.email,
    subject: 'Wallet Credited',
    body: `Your wallet has been credited with ₹${request.amount}.`
  });
}
```

## React Query Integration

```typescript
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { canteen } from '@/api/canteenClient';

// Fetch menu items
function useMenuItems() {
  return useQuery('menuItems', () => canteen.entities.MenuItem.list());
}

// Fetch user orders with auto-refresh
function useMyOrders() {
  return useQuery(
    'myOrders',
    () => canteen.entities.Order.filter({ created_by: user.email }, '-created_date'),
    {
      refetchInterval: 3000, // Refresh every 3 seconds
    }
  );
}

// Create order mutation
function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation(
    (orderData: any) => canteen.entities.Order.create(orderData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('myOrders');
      }
    }
  );
}

// Usage in component
function MenuPage() {
  const { data: items, isLoading } = useMenuItems();
  const createOrder = useCreateOrder();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {items?.map(item => (
        <MenuItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
```

## Error Handling

```typescript
try {
  const order = await canteen.entities.Order.create(orderData);
} catch (error) {
  if (error.message.includes('required')) {
    // Handle validation error
  } else if (error.message.includes('Permission')) {
    // Handle permission error
  } else if (error.message.includes('Session expired')) {
    // Redirect to login
    canteen.auth.redirectToLogin();
  } else {
    // Handle other errors
    console.error('Order creation failed:', error);
  }
}
```

## TypeScript Types

The backend automatically validates types based on entity schemas. Common errors:

- **Missing required fields**: Check entity schema for required fields
- **Invalid enum values**: Check allowed values in schema
- **Type mismatches**: Ensure numbers are numbers, strings are strings
- **Permission denied**: Check user role and entity permissions
