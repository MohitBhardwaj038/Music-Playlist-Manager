# Setup Instructions - Music Playlist Manager

## Step-by-Step Setup Guide

### 📋 Prerequisites Check

Before starting, make sure you have:
- ✅ Node.js installed (v14 or higher): Run `node --version`
- ✅ PostgreSQL installed (v12 or higher): Run `psql --version`
- ✅ npm or yarn: Run `npm --version`

---

### 🗄️ Step 1: Install PostgreSQL (if not installed)

**Windows:**
```powershell
# Download installer from:
https://www.postgresql.org/download/windows/

# Or use Chocolatey:
choco install postgresql
```

**Verify Installation:**
```powershell
psql --version
```

---

### 🔧 Step 2: Configure PostgreSQL

**Option A: Use default postgres user**
```powershell
# Note the password you set during PostgreSQL installation
# Default user: postgres
# Default port: 5432
```

**Option B: Create dedicated user (recommended)**
```powershell
# Open PowerShell as Administrator and run:
psql -U postgres

# Inside psql prompt:
CREATE USER music_user WITH PASSWORD 'secure_password_123';
ALTER USER music_user CREATEDB;
\q
```

---

### 📦 Step 3: Backend Setup

```powershell
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env file with your credentials
notepad .env
```

**Update these values in .env:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres  # or music_user if you created one
DB_PASSWORD=YOUR_POSTGRES_PASSWORD
DB_NAME=music_playlist_db
JWT_SECRET=change_this_to_a_random_32_character_string
```

**Generate a secure JWT_SECRET:**
```powershell
# In PowerShell:
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

---

### 🗃️ Step 4: Initialize Database

```powershell
# Still in backend folder
npm run init-db
```

**Expected Output:**
```
Connected to PostgreSQL server
Creating database: music_playlist_db
✅ Database 'music_playlist_db' created successfully
Connected to music_playlist_db database
Creating tables and indexes...
✅ All tables and indexes created successfully

📋 Created tables:
   - users
   - playlists
   - playlist_songs
   - favorites
   - listening_history

✨ Database initialization completed successfully!
```

**If you get an error:**
1. Make sure PostgreSQL service is running:
   ```powershell
   # Check status
   Get-Service postgresql*
   
   # Start if stopped
   Start-Service postgresql-x64-16  # adjust version number
   ```

2. Verify credentials in .env file
3. Check if database already exists and drop if needed:
   ```powershell
   psql -U postgres
   DROP DATABASE IF EXISTS music_playlist_db;
   \q
   npm run init-db
   ```

---

### 🚀 Step 5: Start Backend Server

```powershell
# In backend folder
npm run dev
```

**You should see:**
```
✅ Database connected successfully
🚀 Server running on http://localhost:5000
📊 Environment: development
🗄️  Database: music_playlist_db
```

**Test the backend:**
```powershell
# Open new PowerShell window
curl http://localhost:5000/api/health
```

**Expected response:**
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected"
}
```

---

### 🎨 Step 6: Frontend Setup

```powershell
# Open NEW PowerShell window
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start development server
npm run dev
```

**You should see:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

### ✅ Step 7: Test the Application

1. **Open browser:** Navigate to `http://localhost:5173`

2. **Register an account:**
   - Click "Register" (if on login page)
   - Enter name, email, password
   - Accept terms
   - Click Register

3. **Login:**
   - Enter your email and password
   - You should be redirected to home page

4. **Create a playlist:**
   - In the sidebar, enter playlist name
   - Click "+ Create Playlist"

5. **Search and add songs:**
   - Use search bar in navbar
   - Click on a song to play it
   - Add songs to your playlist

---

### 🐛 Troubleshooting

#### Backend won't start
```powershell
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process if needed
taskkill /PID <PID_NUMBER> /F
```

#### Database connection error
```powershell
# Verify PostgreSQL is running
Get-Service postgresql*

# Test connection manually
psql -U postgres -d music_playlist_db

# Inside psql, verify tables:
\dt
```

#### Frontend can't connect to backend
- Check if backend is running on port 5000
- Verify `.env` in frontend has correct API URL
- Check browser console for CORS errors

#### "Token expired" error
- JWT tokens expire after 7 days
- Simply login again to get a new token

---

### 🔍 Verify Everything Works

**Test Checklist:**
- [ ] Backend server running (http://localhost:5000)
- [ ] Frontend server running (http://localhost:5173)
- [ ] Can register new account
- [ ] Can login with credentials
- [ ] Can create playlist
- [ ] Can search for songs
- [ ] Can play song preview
- [ ] Can add song to playlist
- [ ] Can view playlist details
- [ ] Can delete playlist
- [ ] Logout works and requires login again

---

### 📚 Next Steps

1. **Explore Features:**
   - Try the search functionality
   - Create multiple playlists
   - Like songs (favorites)
   - Check listening history

2. **Customize:**
   - Modify styles in frontend/src/styles/
   - Add your own features
   - Experiment with the API

3. **Deploy (Optional):**
   - Backend: Railway, Render, or Heroku
   - Frontend: Vercel or Netlify
   - Database: Use hosted PostgreSQL

---

### 📞 Need Help?

Common issues and solutions:

1. **"Cannot connect to database"**
   - Ensure PostgreSQL is installed and running
   - Check .env credentials
   - Verify database exists: `psql -U postgres -l`

2. **"Port already in use"**
   - Change PORT in backend/.env
   - Or kill process using that port

3. **"Module not found"**
   - Run `npm install` in the respective directory
   - Delete node_modules and package-lock.json, then reinstall

4. **Frontend can't fetch data**
   - Check browser console for errors
   - Verify backend is running
   - Check CORS settings in backend/index.js

---

### 🎉 Success!

You now have a fully functional music playlist manager with:
- ✅ Secure authentication
- ✅ PostgreSQL database
- ✅ JWT authorization
- ✅ Playlist management
- ✅ Search functionality
- ✅ Listening history
- ✅ Favorites system

**This project is now resume-ready!**

Don't forget to:
- Add screenshots
- Deploy to production
- Document any custom features you add
- Include in your portfolio/resume
