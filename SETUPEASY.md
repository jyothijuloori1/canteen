# Easy Setup Guide - Campus Canteen App

This guide will help you set up and run the Campus Canteen application from scratch.

## 📋 Prerequisites Checklist

Before starting, make sure you have:
- [ ] Node.js 18+ installed
- [ ] PostgreSQL installed and running
- [ ] npm or yarn package manager
- [ ] Code editor (VS Code recommended)

## 🚀 Step-by-Step Setup

### Step 1: Install Node.js (if not installed)

1. Visit: https://nodejs.org/
2. Download the LTS version (18.x or higher)
3. Run the installer and follow the setup wizard
4. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### Step 2: Install PostgreSQL

#### Windows:
1. Visit: https://www.postgresql.org/download/windows/
2. Download the PostgreSQL installer
3. Run the installer:
   - Choose installation directory (default is fine)
   - **Remember the password** you set for the `postgres` user
   - Keep default port: 5432
   - Complete the installation
4. Verify installation:
   - Open pgAdmin (installed with PostgreSQL)
   - Or use command line: `psql --version`

#### Alternative: Use Docker (if you have Docker Desktop)
```bash
docker run --name canteen-postgres -e POSTGRES_PASSWORD=password123 -e POSTGRES_DB=canteen_db -p 5432:5432 -d postgres:15
```

### Step 3: Create PostgreSQL Database

**Option A: Using pgAdmin (GUI)**
1. Open pgAdmin
2. Connect to PostgreSQL server (use the password you set)
3. Right-click on "Databases" → Create → Database
4. Name: `canteen_db`
5. Click Save

**Option B: Using Command Line**
```bash
# Open Command Prompt or PowerShell
psql -U postgres

# Enter your password when prompted
# Then run:
CREATE DATABASE canteen_db;

# Exit
\q
```

### Step 4: Clone/Download the Project

If you have the project files, navigate to the project directory:
```bash
cd c:\Users\jyoth\Desktop\shiva\canteen
```

### Step 5: Backend Setup

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   This will install all required packages (takes 1-2 minutes)

3. **Configure environment:**
   - The `.env` file should already exist
   - Open `backend/.env` in a text editor
   - Update the `DATABASE_URL` with your PostgreSQL password:
     ```env
     DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/canteen_db
     ```
     Replace `YOUR_PASSWORD` with the password you set during PostgreSQL installation

4. **Run database migrations:**
   ```bash
   npm run migrate
   ```
   This creates all the database tables automatically.

5. **Seed the database (optional but recommended):**
   ```bash
   npm run seed
   ```
   This creates test users and sample menu items.

6. **Start the backend server:**
   ```bash
   npm run dev
   ```
   You should see: `🚀 Server running on http://localhost:3001`

   **Keep this terminal window open!**

### Step 6: Frontend Setup

1. **Open a NEW terminal window** (keep backend running)

2. **Navigate to project root:**
   ```bash
   cd c:\Users\jyoth\Desktop\shiva\canteen
   ```

3. **Install frontend dependencies:**
   ```bash
   npm install
   ```
   This will install React and all frontend packages.

4. **Configure frontend environment (optional):**
   - Create `.env` file in the root directory if it doesn't exist
   - Add:
     ```env
     VITE_API_URL=http://localhost:3001/api
     ```

5. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   You should see: `Local: http://localhost:5173`

### Step 7: Access the Application

1. Open your web browser
2. Go to: **http://localhost:5173**
3. You should see the login page

### Step 8: Login

Use these test credentials (created by seed script):

**Admin Account:**
- Email: `admin@canteen.com`
- Password: `password123`

**Student Account:**
- Email: `student@canteen.com`
- Password: `password123`

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Backend server running on port 3001
- [ ] Frontend server running on port 5173
- [ ] Can access login page in browser
- [ ] Can login with test credentials
- [ ] Can see menu items (if logged in as student)
- [ ] Can access admin dashboard (if logged in as admin)

## 🛠️ Running the Project Daily

Once everything is set up, to run the project:

1. **Start PostgreSQL** (if not running as a service)
   - Windows: Check Services → PostgreSQL
   - Or start manually if needed

2. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

3. **Start Frontend** (in a new terminal):
   ```bash
   npm run dev
   ```

4. **Open browser:** http://localhost:5173

## 🔧 Troubleshooting

### Backend won't start
- **Error: "ECONNREFUSED"**
  - PostgreSQL is not running
  - Solution: Start PostgreSQL service or check connection string

- **Error: "Port 3001 already in use"**
  - Another process is using port 3001
  - Solution: Change `PORT` in `backend/.env` to another port (e.g., 3002)

### Frontend won't start
- **Error: "Port 5173 already in use"**
  - Another process is using port 5173
  - Solution: Kill the process or use a different port

### Database connection errors
- Check `DATABASE_URL` in `backend/.env`
- Verify PostgreSQL is running
- Test connection: `psql -U postgres -d canteen_db`

### Can't login
- Make sure you ran `npm run seed` in backend
- Check if users exist in database
- Verify password is correct

## 📝 Quick Commands Reference

```bash
# Backend
cd backend
npm install          # Install dependencies (first time only)
npm run migrate      # Create database tables
npm run seed         # Add test data
npm run dev          # Start backend server

# Frontend
npm install          # Install dependencies (first time only)
npm run dev          # Start frontend server
npm run build        # Build for production
```

## 🎯 Next Steps

After successful setup:
1. Explore the application features
2. Review `USAGE.md` for API usage examples
3. Check `ARCHITECTURE.md` for system details
4. Start developing new features!

## 💡 Tips

- Keep both terminals open (backend + frontend)
- Backend must run before frontend
- Use `Ctrl+C` to stop servers
- Check terminal output for errors
- Database persists data between restarts

## 🆘 Need Help?

- Check `QUICK_START.md` for quick reference
- Review `SETUP.md` for detailed setup
- Check `README.md` for project overview
- Verify all prerequisites are installed

---

**Happy Coding! 🚀**
