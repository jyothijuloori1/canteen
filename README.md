# Campus Canteen App

A modern, responsive web application for managing campus canteen operations with real-time order tracking, wallet management, and admin controls.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Design System](#design-system)
- [Project Structure](#project-structure)
- [Page Architecture](#page-architecture)
- [Routing](#routing)
- [State Management](#state-management)
- [Installation](#installation)
- [Usage](#usage)
- [Development Guidelines](#development-guidelines)

## 🎯 Overview

The Campus Canteen App is a full-stack solution designed to streamline food ordering and management for campus canteens. It provides separate interfaces for students (ordering, tracking, wallet management) and administrators (menu management, order processing, top-up verification).

## ✨ Features

### Student Features
- 🍔 Browse menu with category filtering and search
- 🛒 Shopping cart with quantity management
- 💳 Multiple payment options (Campus Wallet, UPI, Cash on Delivery)
- 📅 Schedule orders for later
- 📱 Real-time order tracking with live delivery updates
- 💰 Wallet management with top-up requests
- 📊 Order history and status tracking
- 🎁 Welcome bonus for new users

### Admin Features
- 📊 Dashboard with revenue and order statistics
- 🍽️ Menu management (add, edit, delete items)
- 📦 Order management with status updates
- 🚚 Delivery tracking and management
- 💵 Top-up request verification and approval
- ⏰ Scheduled order handling
- 🔄 Real-time order status updates

## 🛠️ Tech Stack

- **Frontend Framework**: React (SPA)
- **Styling**: TailwindCSS utility classes
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **State Management**: React Query
- **Routing**: React Router
- **Maps**: React Leaflet (for delivery tracking)
- **Authentication**: Custom email/password authentication
- **Storage**: LocalStorage (cart persistence, user session)

## 🎨 Design System

### Color Palette

- **Primary**: Orange (#FF6B35, #FF8A5B)
- **Success**: Green (#4CAF50, #10B981)
- **Warning**: Yellow (#FCD34D, #F59E0B)
- **Danger**: Red (#EF4444, #DC2626)
- **Neutral**: Gray scale (#F9FAFB to #111827)

### Typography

- **Fonts**: System fonts (SF Pro, Inter, Segoe UI)
- Responsive font sizing with TailwindCSS typography utilities

### Styling Approach

- **Framework**: TailwindCSS utility classes
- **Components**: shadcn/ui component library
- **Layout**: Responsive (mobile-first approach)
- **Effects**: Gradient backgrounds, glass-morphism cards
- **Animations**: Smooth transitions with Framer Motion

### Layout Structure

#### Desktop
- Fixed left sidebar (288px width) with navigation
- Main content area (remaining width)
- Profile section in sidebar with wallet balance

#### Mobile
- Fixed top header with hamburger menu
- Slide-in drawer navigation from right
- Bottom spacing for thumb-friendly access

#### Common Elements
- Notification bell (top-right) with unread badge
- User avatar with initials
- Logout button in sidebar/drawer

## 📁 Project Structure

```
canteen/
├── src/
│   ├── components/
│   │   ├── shared/
│   │   │   ├── NotificationBell.tsx
│   │   │   └── Layout.tsx
│   │   ├── student/
│   │   │   ├── MenuItemCard.tsx
│   │   │   ├── CartItem.tsx
│   │   │   ├── OrderCard.tsx
│   │   │   └── DeliveryTracker.tsx
│   │   └── admin/
│   │       ├── MenuItemDialog.tsx
│   │       └── AdminOrderCard.tsx
│   ├── pages/
│   │   ├── student/
│   │   │   ├── Home.tsx
│   │   │   ├── Menu.tsx
│   │   │   ├── Cart.tsx
│   │   │   ├── Payment.tsx
│   │   │   ├── OrderConfirmation.tsx
│   │   │   ├── MyOrders.tsx
│   │   │   ├── Wallet.tsx
│   │   │   └── CompleteProfile.tsx
│   │   └── admin/
│   │       ├── AdminDashboard.tsx
│   │       ├── ManageMenu.tsx
│   │       ├── AdminOrders.tsx
│   │       └── AdminTopUps.tsx
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── utils/
│   │   └── api.ts
│   ├── App.tsx
│   └── index.tsx
├── public/
├── package.json
└── README.md
```

## 📄 Page Architecture

### Public Pages

#### 0. Login (`/login`)
- Email/password authentication
- Quick login buttons for testing (Student/Admin)
- Redirects to dashboard after successful authentication
- Demo credentials provided on login page

### Student Pages (8 Pages)

#### 1. Home (`/home`)
**Purpose**: Landing page with hero, features, and specials

**Sections**:
- Hero section with gradient background
- Features grid (Fast Delivery, Fresh Food, Easy Payment)
- Today's Specials (horizontal scrollable cards)
- Footer CTA

**Navigation**:
- Browse Menu → Menu page
- Order Now → Adds to cart → Cart page
- Track Orders → MyOrders page

#### 2. Menu (`/menu`)
**Purpose**: Browse and search all menu items

**Features**:
- Search bar with real-time filtering
- Category tabs (All, Breakfast, Lunch, Snacks, Beverages, Desserts)
- Responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
- Menu item cards with images, badges, and pricing
- Add to Cart functionality

**Menu Item Card**:
- Square image with rounded corners
- Availability badges
- Item name, description, price
- Category badge
- Add to Cart button

#### 3. Cart (`/cart`)
**Purpose**: Review items, update quantities, proceed to checkout

**Layout**:
- Cart items list (left side, 2/3 width desktop)
- Order summary card (right side sticky, 1/3 width desktop)
- Quantity controls with increment/decrement
- Remove item functionality
- Tax calculation (GST 5%)
- Proceed to Payment button

**Navigation**:
- If profile incomplete → CompleteProfile
- Else → Payment page

#### 4. Payment (`/payment`)
**Purpose**: Select payment method and complete order

**Payment Methods**:
1. **Campus Wallet**: Shows balance, insufficient balance warning
2. **UPI Payment**: QR code + UPI ID, transaction ID input
3. **Cash on Delivery**: Place order with COD option

**Additional Features**:
- Schedule order toggle (date + time picker)
- Order summary display
- Payment method selection cards

**Navigation**: Successful payment → OrderConfirmation page

#### 5. OrderConfirmation (`/order-confirmation/:orderId`)
**Purpose**: Show order success, QR code, live tracking

**Components**:
- Success animation (checkmark, confetti)
- Order number display
- QR code card (scannable for pickup)
- Progress tracker timeline
- Order details card
- Delivery tracking map (if out for delivery)

**Progress Timeline**:
- Pending (yellow) → Preparing (blue) → Ready (green) → Delivered (green)
- Active step with pulse animation
- Estimated time countdown

#### 6. MyOrders (`/my-orders`)
**Purpose**: View all past and active orders

**Features**:
- Filter dropdown (All, Pending, Preparing, Ready, Out for Delivery, Delivered, Cancelled)
- Responsive grid layout (2-3 columns)
- Order cards with status badges
- Estimated time progress bars
- View details button

**Status Colors**:
- Pending: Yellow
- Preparing: Blue
- Ready: Green
- Out for Delivery: Orange
- Delivered: Green
- Cancelled: Red

#### 7. Wallet (`/wallet`)
**Purpose**: Manage wallet balance, add money, view transactions

**Features**:
- Balance card with gradient background
- QR code toggle
- Add money input with quick amount buttons
- Quick stats card (credits, debits, pending requests)
- Transactions tab (credit/debit history)
- Top-Up Requests tab (pending/approved/rejected)

**Add Money Flow**:
1. Pay via UPI (QR code or UPI link)
2. Enter transaction details
3. Upload screenshot (optional)
4. Submit request for admin approval

#### 8. CompleteProfile (`/complete-profile`)
**Purpose**: First-time profile setup after registration

**Form Fields**:
- Roll Number
- Year (1st, 2nd, 3rd, 4th)
- Branch (CSE, ECE, ME, etc.)
- Phone Number

**Bonus**: ₹50 welcome bonus credited after profile completion

### Admin Pages (4 Pages)

#### 9. AdminDashboard (`/admin-dashboard`)
**Purpose**: Overview of canteen operations

**Components**:
- Stats cards (Today's Revenue, Special Items, Pending Orders, Total Orders)
- Quick action buttons (Manage Menu, View Orders)
- Recent orders table (last 5 orders)

#### 10. ManageMenu (`/manage-menu`)
**Purpose**: Add, edit, delete menu items

**Features**:
- Menu grid with item cards
- Add New Item button
- Edit/Delete actions per item
- Availability toggle switch
- Add/Edit dialog with form fields:
  - Name, Description, Price
  - Category, Image URL
  - Special item checkbox
  - Available checkbox

#### 11. AdminOrders (`/admin-orders`)
**Purpose**: View and manage all orders

**Features**:
- Filter dropdown with status counts
- Order cards with status badges
- Progress bars and time tracking
- Action buttons based on status:
  - Scheduled → Start Order
  - Pending → Mark Preparing
  - Preparing → Mark Ready
  - Ready → Start Delivery, Pickup Complete, Extend Time, Cancel
  - Out for Delivery → Mark Delivered
- Start Delivery dialog (location, ETA)
- Cancel & Refund dialog (refund calculation)
- QR code dialog for order verification
- Auto-refresh every 3 seconds

#### 12. AdminTopUps (`/admin-topups`)
**Purpose**: Verify and approve wallet top-up requests

**Features**:
- Stats cards (Pending, Approved, Rejected, Total)
- Filter dropdown
- Request cards with:
  - Amount, status, student details
  - Transaction ID
  - Screenshot view button
  - Approve/Reject actions
- Approve dialog (balance calculation, verification warning)
- Reject dialog (reason textarea, email notification)

## 🗺️ Routing

### Student Routes (Protected)
```
/home
/menu
/cart
/payment
/order-confirmation/:orderId
/my-orders
/wallet
/complete-profile
```

### Admin Routes (Protected + Role Check)
```
/admin-dashboard
/manage-menu
/admin-orders
/admin-topups
```

### Default Redirects
- **Student** → `/home`
- **Admin** → `/admin-dashboard`

## 🔄 State Management

### React Query
Used for server state management:
- User data (currentUser)
- Menu items
- Orders
- Wallet transactions
- Top-up requests
- Notifications

**Auto-refetch Intervals**: Real-time updates every 3 seconds for active orders

### LocalStorage
- Cart items (persists across sessions)
- User session data
- Auth token

## 🚀 Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd canteen
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Configure the following variables:
   - `VITE_API_URL`: Backend API URL (optional)
   - `VITE_MAP_API_KEY`: Map service API key (for delivery tracking, optional)

4. **Start development server**
   ```bash
   npm start
   # or
   yarn start
   ```

5. **Build for production**
   ```bash
   npm run build
   # or
   yarn build
   ```

## 💻 Usage

### Development

1. Start the development server
2. Access the app at `http://localhost:5173`
3. Login using the login page:
   - **Student**: `student@canteen.com` / `password123`
   - **Admin**: `admin@canteen.com` / `password123`
   - Or use the quick login buttons
4. Complete profile setup (for first-time student users)
5. Start browsing menu and placing orders

### Production

1. Build the application: `npm run build`
2. Serve the `build` folder using a static file server
3. Configure your server to handle client-side routing

## 📐 Development Guidelines

### Responsive Breakpoints

- **Mobile**: < 640px (1 column grids, bottom nav)
- **Tablet**: 640px - 1024px (2 column grids, side nav)
- **Desktop**: > 1024px (3 column grids, full sidebar)

### Animation Patterns

- **Page transitions**: Fade + slide up
- **Card hovers**: Lift (translateY -4px) + shadow increase
- **Button clicks**: Scale down (0.95) on tap
- **Loading states**: Spinner or skeleton loaders
- **Success states**: Confetti or checkmark animations
- **Status changes**: Smooth color transitions

### Component Guidelines

1. Use shadcn/ui components for consistency
2. Follow mobile-first responsive design
3. Implement proper loading and error states
4. Use React Query for data fetching
5. Persist cart in LocalStorage
6. Implement proper form validation
7. Use Framer Motion for animations
8. Follow accessibility best practices

### Code Style

- Use TypeScript for type safety
- Follow React best practices (hooks, functional components)
- Use TailwindCSS utility classes
- Keep components modular and reusable
- Implement proper error handling
- Add loading states for async operations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- shadcn/ui for the component library
- TailwindCSS for the utility-first CSS framework
- Framer Motion for animations
- React Query for state management
