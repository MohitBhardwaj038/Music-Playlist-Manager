# Music Playlist Manager

A full-stack music playlist management application with secure authentication, playlist management, favorites, listening history, and music discovery features.

## 🌟 Project Overview

This is a **resume-worthy** project that demonstrates:
- Full-stack development (React + Node.js + PostgreSQL)
- Secure authentication & authorization (JWT + bcrypt)
- RESTful API design
- Database modeling and optimization
- Modern frontend practices (React Hooks, Context API, Protected Routes)
- Environment-based configuration
- Clean code architecture

## ✨ Key Features

### Phase 1 - Foundation ✅
- ✅ PostgreSQL database with proper schema design
- ✅ JWT-based authentication with password hashing
- ✅ Authorization middleware (`verifyJWT`)
- ✅ Consolidated backend server architecture
- ✅ Environment variable configuration

### Phase 2 - Core Features ✅
- ✅ User registration and login
- ✅ User profile and dashboard with statistics
- ✅ Create, edit, delete playlists
- ✅ Add/remove songs to playlists
- ✅ Search songs using iTunes API
- ✅ Favorites system (like songs)
- ✅ Listening history tracking
- ✅ Public playlist sharing with tokens
- ✅ Recently played songs
- ✅ Dashboard with user statistics

## 🚀 Quick Start

### Prerequisites
- Node.js v14+
- PostgreSQL v12+
- npm or yarn

### 1. Clone Repository
```bash
git clone <repository-url>
cd music-playlist-manager
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Initialize database
npm run init-db

# Start backend server
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173`

### 4. Create Account & Login
1. Navigate to `http://localhost:5173/login`
2. Register a new account
3. Login with your credentials
4. Start creating playlists!

## 📁 Project Structure

```
music-playlist-manager/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── init-db.sql
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── playlistController.js
│   │   ├── favoritesController.js
│   │   ├── historyController.js
│   │   └── songController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── scripts/
│   │   └── initDatabase.js
│   ├── index.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── MusicPlayer.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Playlists.jsx
    │   │   └── PlaylistDetails.jsx
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

## 🔐 Security Features

- ✅ Password hashing with bcrypt (salt rounds: 10)
- ✅ JWT token authentication (7-day expiry)
- ✅ Protected API routes with middleware
- ✅ SQL injection prevention (parameterized queries)
- ✅ Authorization checks (users can only access their own data)
- ✅ CORS configuration
- ✅ Environment-based secrets

## 🗄️ Database Schema

### Users
- User authentication and profile information
- Password stored as bcrypt hash

### Playlists
- User-owned playlists
- Public/private visibility
- Share tokens for public playlists

### Playlist Songs
- Many-to-many relationship between playlists and songs
- Stores song metadata from iTunes API

### Favorites
- User's favorite songs
- Quick access to liked music

### Listening History
- Tracks every song played
- Enables recently played and statistics

## 📱 Main Features

1. **Authentication System**
   - Secure registration with email validation
   - Login with JWT token
   - Session persistence
   - Logout functionality

2. **Playlist Management**
   - Create custom playlists
   - Add/remove songs
   - Delete playlists
   - Share playlists publicly

3. **Music Discovery**
   - Search iTunes library
   - View trending songs
   - Song previews (30-second clips)

4. **User Dashboard**
   - Total playlists count
   - Total favorites
   - Total plays
   - Most played songs
   - Recent activity

5. **Music Player**
   - Play song previews
   - Volume control
   - Seek/scrub functionality
   - Currently playing display

## 🛠️ Technologies Used

### Backend
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **pg** - PostgreSQL client
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **axios** - HTTP client
- **dotenv** - Environment configuration

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Context API** - State management
- **Vite** - Build tool
- **CSS Modules** - Styling

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Playlists
- `GET /api/playlists` - Get all playlists (protected)
- `POST /api/playlists` - Create playlist (protected)
- `GET /api/playlists/:id` - Get playlist (protected)
- `PUT /api/playlists/:id` - Update playlist (protected)
- `DELETE /api/playlists/:id` - Delete playlist (protected)
- `POST /api/playlists/:id/songs` - Add song (protected)
- `DELETE /api/playlists/:id/songs/:songId` - Remove song (protected)

### Favorites & History
- `GET /api/favorites` - Get favorites (protected)
- `POST /api/favorites` - Add favorite (protected)
- `DELETE /api/favorites/:trackId` - Remove favorite (protected)
- `GET /api/history` - Get history (protected)
- `POST /api/history` - Track song play (protected)

## 🎯 Resume Highlights

This project demonstrates:

1. **Full-Stack Development**
   - Complete frontend-to-backend integration
   - RESTful API design
   - Database design and optimization

2. **Security Best Practices**
   - JWT authentication
   - Password hashing
   - Protected routes
   - Authorization checks

3. **Modern React Patterns**
   - Hooks (useState, useEffect, useContext)
   - Context API for state management
   - Protected routes
   - Component composition

4. **Database Skills**
   - PostgreSQL schema design
   - Foreign keys and relationships
   - Indexes for performance
   - SQL queries and optimization

5. **Professional Development**
   - Environment configuration
   - Error handling
   - Code organization
   - Git version control

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=music_playlist_db
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRES_IN=7d
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🚧 Future Enhancements (Phase 3+)

- [ ] Input validation with Joi/Zod
- [ ] Unit and integration tests
- [ ] Swagger API documentation
- [ ] Spotify API integration
- [ ] Collaborative playlists
- [ ] Social features (follow users)
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Cloud deployment

## 📄 License

MIT

## 👨‍💻 Author

Your Name
- GitHub: [@yourusername]
- LinkedIn: [Your LinkedIn]
- Email: your.email@example.com

---

**Note**: This project is designed to be portfolio/resume-ready. Make sure to:
1. Deploy to a live URL (Vercel + Railway/Render)
2. Add screenshots to README
3. Create a demo video
4. Document challenges and solutions
5. List key features in your resume
