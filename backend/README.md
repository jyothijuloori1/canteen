# Campus Canteen Backend API

A robust, auto-generated REST API backend built with Node.js, Express, and PostgreSQL. This backend automatically generates CRUD operations from JSON entity schemas, similar to Firebase/Supabase but with full control.

## 🎯 Features

- **Auto-Generated APIs**: Define JSON schemas → Get full REST APIs automatically
- **PostgreSQL Database**: Robust relational database with auto-migrations
- **JWT Authentication**: Secure token-based authentication
- **Row-Level Security**: Automatic permission checking based on user roles
- **File Upload**: Built-in file upload service with validation
- **Email Service**: Integrated email notifications
- **Type Safety**: Full TypeScript support
- **Schema Validation**: Automatic validation based on entity definitions

## 📁 Project Structure

```
backend/
├── entities/              # JSON schema definitions
│   ├── User.json
│   ├── MenuItem.json
│   ├── Order.json
│   ├── WalletTransaction.json
│   ├── TopUpRequest.json
│   ├── PaymentSettings.json
│   └── Notification.json
├── src/
│   ├── config/
│   │   └── database.ts    # PostgreSQL connection
│   ├── database/
│   │   ├── migrate.ts     # Auto-migration from schemas
│   │   └── seed.ts        # Database seeding
│   ├── middleware/
│   │   ├── auth.ts        # JWT authentication
│   │   └── permissions.ts # Row-level security
│   ├── routes/
│   │   ├── auth.ts        # Authentication routes
│   │   ├── entityRoutes.ts # Auto-generated entity routes
│   │   └── integrations.ts # Email, file upload
│   ├── services/
│   │   ├── email.ts       # Email service
│   │   └── upload.ts      # File upload service
│   ├── utils/
│   │   ├── schemaLoader.ts # Load entity schemas
│   │   └── validator.ts   # Schema validation
│   └── server.ts          # Express server
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/canteen_db
   JWT_SECRET=your-super-secret-jwt-key
   PORT=3001
   ```

3. **Create PostgreSQL database**
   ```sql
   CREATE DATABASE canteen_db;
   ```

4. **Run migrations**
   ```bash
   npm run migrate
   ```

5. **Seed database (optional)**
   ```bash
   npm run seed
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## 📚 API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

#### Update Current User
```http
PUT /api/auth/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "full_name": "Jane Doe",
  "wallet_balance": 500
}
```

### Entity Operations

All entities support the following operations:

#### List Entities
```http
GET /api/entities/{EntityName}
GET /api/entities/{EntityName}?category=Lunch&sort=-created_date&limit=20
```

#### Get Single Entity
```http
GET /api/entities/{EntityName}/{id}
```

#### Create Entity
```http
POST /api/entities/{EntityName}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Burger",
  "price": 99.99,
  "category": "Lunch"
}
```

#### Bulk Create
```http
POST /api/entities/{EntityName}/bulk
Authorization: Bearer {token}
Content-Type: application/json

[
  { "name": "Item 1", "price": 10 },
  { "name": "Item 2", "price": 20 }
]
```

#### Update Entity
```http
PUT /api/entities/{EntityName}/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "price": 109.99
}
```

#### Delete Entity
```http
DELETE /api/entities/{EntityName}/{id}
Authorization: Bearer {token}
```

#### Get Schema
```http
GET /api/entities/{EntityName}/schema
```

### Integration Services

#### Send Email
```http
POST /api/integrations/send-email
Authorization: Bearer {token}
Content-Type: application/json

{
  "to": "user@example.com",
  "subject": "Order Confirmed",
  "body": "Your order #123 is ready!"
}
```

#### Upload File
```http
POST /api/integrations/upload-file
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [binary]
```

## 🔒 Security & Permissions

### Row-Level Security

Each entity schema defines permissions:

```json
{
  "permissions": {
    "read": { "own": true, "admin": true },
    "create": { "authenticated": true },
    "update": { "own": false, "admin": true },
    "delete": { "admin": true },
    "list": { "own": true, "admin": true }
  }
}
```

- **own**: User can only access their own records (created_by = user.email)
- **admin**: Only admin users can perform this action
- **authenticated**: Any authenticated user can perform this action
- **public**: Anyone can perform this action

### Auto-Generated Fields

Every entity automatically gets:
- `id` (UUID)
- `created_date` (timestamp)
- `updated_date` (timestamp)
- `created_by` (user email)

## 📝 Entity Schema Format

Example entity schema (`entities/MenuItem.json`):

```json
{
  "name": "MenuItem",
  "tableName": "menu_items",
  "fields": {
    "name": {
      "type": "string",
      "required": true
    },
    "price": {
      "type": "number",
      "required": true,
      "minimum": 0
    },
    "category": {
      "type": "string",
      "enum": ["Breakfast", "Lunch", "Snacks"],
      "required": true
    },
    "is_available": {
      "type": "boolean",
      "default": true
    }
  },
  "permissions": {
    "read": { "authenticated": true },
    "create": { "admin": true },
    "update": { "admin": true },
    "delete": { "admin": true },
    "list": { "authenticated": true }
  }
}
```

### Field Types

- `string`: Text field
- `number`: Numeric field
- `boolean`: True/false field
- `json`: JSON object/array (stored as JSONB in PostgreSQL)

### Field Options

- `required`: Field is required
- `unique`: Field must be unique
- `default`: Default value
- `enum`: Allowed values
- `minimum`/`maximum`: Numeric constraints
- `minLength`: String length constraint
- `format`: Special format (email, date)
- `hidden`: Field not returned in responses (e.g., passwords)

## 🔧 Development

### Adding a New Entity

1. Create a new JSON file in `entities/` folder
2. Define the schema with fields and permissions
3. Run `npm run migrate` to create the table
4. The API routes are automatically available!

### Database Migrations

Migrations are automatically generated from entity schemas:

```bash
npm run migrate
```

### Seeding Data

Seed the database with initial data:

```bash
npm run seed
```

## 🧪 Testing

Default test credentials (from seed):
- **Admin**: `admin@canteen.com` / `password123`
- **Student**: `student@canteen.com` / `password123`

## 📦 Production Deployment

1. Set `NODE_ENV=production`
2. Configure production database URL
3. Set strong `JWT_SECRET`
4. Configure SMTP for email
5. Set up file storage (S3, Cloudinary, etc.)
6. Build: `npm run build`
7. Start: `npm start`

## 🐛 Troubleshooting

### Database Connection Error
- Check `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Verify database exists

### Migration Errors
- Drop and recreate database if needed
- Check schema JSON files for syntax errors

### Authentication Issues
- Verify `JWT_SECRET` is set
- Check token expiration
- Ensure user exists in database

## 📄 License

MIT
