# Backend Architecture

## Overview

This backend provides a Base44-like BaaS (Backend as a Service) experience where you define JSON schemas and get full REST APIs automatically. No need to write routes, database queries, or validation logic manually.

## Architecture Diagram

```
Frontend (React)
    ↓
canteenClient SDK (TypeScript)
    ↓
HTTP REST API (Express)
    ↓
Middleware (Auth, Permissions, Validation)
    ↓
Auto-Generated Routes (entityRoutes.ts)
    ↓
Database Layer (PostgreSQL)
```

## Key Components

### 1. Entity Schema System

**Location**: `entities/*.json`

Each entity is defined as a JSON schema with:
- **Fields**: Type definitions, constraints, defaults
- **Permissions**: Read/write/delete/list rules
- **Table mapping**: PostgreSQL table name

**Example**:
```json
{
  "name": "MenuItem",
  "tableName": "menu_items",
  "fields": {
    "name": { "type": "string", "required": true },
    "price": { "type": "number", "minimum": 0 }
  },
  "permissions": {
    "read": { "authenticated": true },
    "create": { "admin": true }
  }
}
```

### 2. Auto-Generated Routes

**Location**: `src/routes/entityRoutes.ts`

For each entity schema, the system automatically creates:
- `GET /api/entities/{EntityName}` - List (with filtering, sorting, pagination)
- `GET /api/entities/{EntityName}/:id` - Get single
- `POST /api/entities/{EntityName}` - Create
- `POST /api/entities/{EntityName}/bulk` - Bulk create
- `PUT /api/entities/{EntityName}/:id` - Update
- `DELETE /api/entities/{EntityName}/:id` - Delete
- `GET /api/entities/{EntityName}/schema` - Get schema

### 3. Database Migration

**Location**: `src/database/migrate.ts`

Automatically generates PostgreSQL tables from entity schemas:
- Creates tables with proper types
- Adds indexes for performance
- Handles defaults and constraints
- No manual SQL needed

### 4. Authentication System

**Location**: `src/routes/auth.ts`, `src/middleware/auth.ts`

- JWT-based authentication
- Password hashing with bcrypt
- Token expiration handling
- User session management

**Endpoints**:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update current user

### 5. Permission System

**Location**: `src/middleware/permissions.ts`

Row-level security based on entity permissions:
- **own**: Users can only access their own records
- **admin**: Only admins can perform action
- **authenticated**: Any logged-in user
- **public**: Anyone

Automatically filters queries based on `created_by` field.

### 6. Validation System

**Location**: `src/utils/validator.ts`

- Type validation (string, number, boolean, json)
- Required field checking
- Enum value validation
- Min/max constraints
- Format validation (email, date)

### 7. Integration Services

**Location**: `src/services/`, `src/routes/integrations.ts`

- **Email Service**: Send emails via SMTP
- **File Upload**: Handle file uploads with validation

## Data Flow

### Create Order Example

1. **Frontend**:
   ```typescript
   await canteen.entities.Order.create({...})
   ```

2. **SDK Client** (`canteenClient.ts`):
   - Adds JWT token to headers
   - Sends POST to `/api/entities/Order`

3. **Auth Middleware**:
   - Validates JWT token
   - Attaches user to request

4. **Permission Check**:
   - Checks if user can create orders
   - Validates based on entity permissions

5. **Validation**:
   - Validates data against schema
   - Checks required fields, types, constraints

6. **Database**:
   - Inserts into `orders` table
   - Adds auto fields (id, created_date, created_by)

7. **Response**:
   - Returns created order
   - Frontend updates UI

## Security Features

### 1. Authentication
- JWT tokens with expiration
- Password hashing (bcrypt)
- Secure token storage

### 2. Authorization
- Role-based access control
- Row-level security
- Permission-based route protection

### 3. Input Validation
- Schema-based validation
- Type checking
- SQL injection prevention (parameterized queries)

### 4. Error Handling
- No sensitive data in errors
- Proper HTTP status codes
- Logging for debugging

## Auto-Generated Fields

Every entity automatically gets:
- `id` (UUID) - Primary key
- `created_date` (timestamp) - Creation time
- `updated_date` (timestamp) - Last update time
- `created_by` (string) - User email who created it

These are added automatically and used for:
- Row-level security filtering
- Audit trails
- Sorting and filtering

## Query Features

### Filtering
```typescript
// Filter by any field
canteen.entities.MenuItem.filter({ category: 'Lunch', is_available: true })
```

### Sorting
```typescript
// Sort by field (prefix with - for descending)
canteen.entities.Order.list('-created_date')
```

### Pagination
```typescript
// Limit results
canteen.entities.MenuItem.list('-created_date', 20)
```

## Extending the System

### Add New Entity

1. Create `entities/NewEntity.json`
2. Define schema with fields and permissions
3. Run `npm run migrate`
4. API routes are automatically available!

### Add Custom Route

1. Create route in `src/routes/`
2. Import in `src/server.ts`
3. Use existing middleware (auth, permissions)

### Add Integration Service

1. Create service in `src/services/`
2. Add route in `src/routes/integrations.ts`
3. Expose via SDK client

## Performance Considerations

- **Indexes**: Automatically created on `created_by` and `created_date`
- **Connection Pooling**: PostgreSQL connection pool
- **Query Optimization**: Parameterized queries prevent SQL injection
- **Caching**: Can add Redis for frequently accessed data

## Scalability

- **Horizontal Scaling**: Stateless design allows multiple instances
- **Database**: PostgreSQL handles large datasets
- **File Storage**: Can migrate to S3/Cloudinary for production
- **Email**: Can use SendGrid, AWS SES for production

## Monitoring

- **Logging**: Console logs for debugging
- **Error Tracking**: Can integrate Sentry
- **Health Check**: `/health` endpoint
- **Database**: Can add query logging

## Comparison with Base44

| Feature | This Backend | Base44 |
|---------|-------------|--------|
| Schema Definition | JSON files | JSON files |
| Auto-Generated APIs | ✅ | ✅ |
| Database | PostgreSQL | Managed |
| Authentication | JWT | Managed |
| File Upload | ✅ | ✅ |
| Email Service | ✅ | ✅ |
| Row-Level Security | ✅ | ✅ |
| Customization | Full control | Limited |
| Cost | Self-hosted | Subscription |
| Deployment | Your choice | Managed |

## Best Practices

1. **Schema Design**: Keep schemas simple and focused
2. **Permissions**: Use least privilege principle
3. **Validation**: Define constraints in schemas
4. **Error Handling**: Handle errors gracefully in frontend
5. **Security**: Use strong JWT secrets in production
6. **Testing**: Test all entity operations
7. **Documentation**: Keep schemas well-documented
