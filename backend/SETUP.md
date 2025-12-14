# Backend Setup Guide

## Quick Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Create a `.env` file in the `backend/` directory:

```env
# Server
PORT=3001
NODE_ENV=development

# Database (update with your PostgreSQL credentials)
DATABASE_URL=postgresql://postgres:password@localhost:5432/canteen_db

# JWT (generate a strong secret for production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# Email (optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@canteen.com

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 3. Create Database
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE canteen_db;

-- Exit
\q
```

### 4. Run Migrations
```bash
npm run migrate
```

This will:
- Read all entity schemas from `entities/` folder
- Create PostgreSQL tables automatically
- Set up indexes and constraints

### 5. Seed Database (Optional)
```bash
npm run seed
```

This creates:
- Admin user: `admin@canteen.com` / `password123`
- Student user: `student@canteen.com` / `password123`
- Sample menu items
- Payment settings

### 6. Start Server
```bash
npm run dev
```

Server will start at `http://localhost:3001`

## Testing the API

### Test Authentication
```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","full_name":"Test User"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@canteen.com","password":"password123"}'

# Get current user (use token from login)
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test Entity Operations
```bash
# List menu items
curl http://localhost:3001/api/entities/MenuItem

# Create order (requires auth token)
curl -X POST http://localhost:3001/api/entities/Order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "order_number": "ORD-001",
    "items": [{"name": "Burger", "quantity": 2}],
    "total_amount": 200,
    "payment_method": "Campus Wallet"
  }'
```

## Frontend Integration

The frontend SDK client is available at `src/api/canteenClient.ts`. Use it like:

```typescript
import { canteen } from '@/api/canteenClient';

// Login
const { token, user } = await canteen.auth.login('user@example.com', 'password');

// Get menu items
const items = await canteen.entities.MenuItem.list();

// Create order
const order = await canteen.entities.Order.create({
  order_number: 'ORD-001',
  items: [...],
  total_amount: 200,
  payment_method: 'Campus Wallet'
});

// Send email
await canteen.integrations.Core.sendEmail({
  to: 'user@example.com',
  subject: 'Order Confirmed',
  body: 'Your order is ready!'
});
```

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `pg_isready`
- Check `DATABASE_URL` format: `postgresql://user:password@host:port/database`
- Ensure database exists

### Migration Errors
- Drop database and recreate if needed
- Check entity JSON files for syntax errors
- Verify all required fields are defined

### Port Already in Use
- Change `PORT` in `.env`
- Or kill process using port 3001

### JWT Errors
- Ensure `JWT_SECRET` is set and at least 32 characters
- Check token expiration settings

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (32+ characters)
- [ ] Configure production database
- [ ] Set up SMTP for email
- [ ] Configure file storage (S3/Cloudinary)
- [ ] Set up SSL/HTTPS
- [ ] Configure CORS properly
- [ ] Set up logging/monitoring
- [ ] Run security audit
- [ ] Set up backups
