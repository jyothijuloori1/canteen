# Quick Start Guide

## ✅ Completed Steps

1. ✅ Dependencies installed
2. ✅ Environment file created (`.env`)
3. ✅ JWT secret generated

## ⚠️ Next Steps Required

### Option 1: Install and Setup PostgreSQL (Recommended)

#### Windows Installation:

1. **Download PostgreSQL**:
   - Visit: https://www.postgresql.org/download/windows/
   - Download the installer
   - Run the installer and follow the setup wizard
   - Remember the password you set for the `postgres` user

2. **Create Database**:
   ```sql
   -- Open pgAdmin or psql command line
   -- Connect to PostgreSQL server
   
   CREATE DATABASE canteen_db;
   ```

3. **Update .env file**:
   Edit `backend/.env` and update:
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/canteen_db
   ```
   Replace `YOUR_PASSWORD` with the password you set during installation.

4. **Run Migration**:
   ```bash
   cd backend
   npm run migrate
   ```

5. **Seed Database** (optional):
   ```bash
   npm run seed
   ```

6. **Start Server**:
   ```bash
   npm run dev
   ```

### Option 2: Use Docker (Easier)

If you have Docker installed:

1. **Start PostgreSQL Container**:
   ```bash
   docker run --name canteen-postgres -e POSTGRES_PASSWORD=password123 -e POSTGRES_DB=canteen_db -p 5432:5432 -d postgres:15
   ```

2. **Update .env file**:
   ```env
   DATABASE_URL=postgresql://postgres:password123@localhost:5432/canteen_db
   ```

3. **Run Migration**:
   ```bash
   cd backend
   npm run migrate
   ```

4. **Seed Database**:
   ```bash
   npm run seed
   ```

5. **Start Server**:
   ```bash
   npm run dev
   ```

### Option 3: Use Online PostgreSQL (Free)

You can use a free PostgreSQL service like:
- **Supabase** (https://supabase.com) - Free tier available
- **Neon** (https://neon.tech) - Free tier available
- **ElephantSQL** (https://www.elephantsql.com) - Free tier available

1. Sign up and create a database
2. Get the connection string
3. Update `.env` with the connection string
4. Run migration and seed

## 🚀 After Database Setup

Once PostgreSQL is running:

```bash
# 1. Run migrations (creates all tables)
cd backend
npm run migrate

# 2. Seed database (creates test users and sample data)
npm run seed

# 3. Start the server
npm run dev
```

The server will start at: **http://localhost:3001**

## 🧪 Test the API

### Test Authentication:
```bash
# Register
curl -X POST http://localhost:3001/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"full_name\":\"Test User\"}"

# Login
curl -X POST http://localhost:3001/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"student@canteen.com\",\"password\":\"password123\"}"
```

### Test Entity Operations:
```bash
# List menu items
curl http://localhost:3001/api/entities/MenuItem
```

## 📝 Default Test Credentials

After running `npm run seed`:
- **Admin**: `admin@canteen.com` / `password123`
- **Student**: `student@canteen.com` / `password123`

## 🔧 Troubleshooting

### PostgreSQL Connection Error
- Ensure PostgreSQL is running
- Check if port 5432 is available
- Verify DATABASE_URL in `.env` is correct
- Test connection: `psql -U postgres -d canteen_db`

### Port Already in Use
- Change `PORT` in `.env` to a different port (e.g., 3002)

### Migration Errors
- Drop and recreate database if needed
- Check entity JSON files for syntax errors

## 📚 Next Steps

1. Connect frontend to backend (update `VITE_API_URL` in frontend `.env`)
2. Test all API endpoints
3. Review `USAGE.md` for frontend integration examples
4. Review `ARCHITECTURE.md` for system details
