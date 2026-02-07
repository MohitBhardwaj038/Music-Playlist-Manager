# Music Playlist Manager - Backend

A secure, scalable REST API for managing music playlists with PostgreSQL database, JWT authentication, and comprehensive user features.

## 🚀 Features

### Phase 1 - Foundation ✅
- **PostgreSQL Database**: Scalable relational database with proper schema
- **JWT Authentication**: Secure token-based authentication with bcrypt password hashing
- **Authorization Middleware**: Protected routes with `verifyJWT` middleware
- **Consolidated Backend**: Single server with organized routing structure

### Phase 2 - Core Features ✅
- **User Management**: Registration, login, profile management
- **Playlist CRUD**: Create, read, update, delete playlists
- **Song Management**: Add/remove songs to/from playlists
- **Favorites**: Like and save favorite songs
- **Listening History**: Track and view listening history
- **Dashboard Stats**: User statistics and insights
- **Playlist Sharing**: Public/private playlists with share tokens

## 📋 Prerequisites

- **Node.js** v14 or higher
- **PostgreSQL** v12 or higher
- **npm** or **yarn**

## 🛠️ Installation

### 1. Install PostgreSQL

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql
```

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database User (Optional)

```bash
# Connect to PostgreSQL
psql -U postgres

# Create a new user (recommended for production)
CREATE USER music_user WITH PASSWORD 'your_secure_password';
ALTER USER music_user CREATEDB;

# Exit
\q
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=music_playlist_db

# JWT Configuration (CHANGE IN PRODUCTION!)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_32_chars
JWT_EXPIRES_IN=7d
```

### 5. Initialize Database

Run the database initialization script:

```bash
npm run init-db
```

This will:
- Create the `music_playlist_db` database
- Create all required tables (users, playlists, favorites, history)
- Set up indexes for performance
- Create triggers for automatic timestamp updates

### 6. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── config/
│   ├── database.js         # PostgreSQL connection pool
│   └── init-db.sql         # Database schema
├── controllers/
│   ├── authController.js   # Authentication logic
│   ├── playlistController.js
│   ├── favoritesController.js
│   ├── historyController.js
│   └── songController.js
├── middleware/
│   └── authMiddleware.js   # JWT verification
├── scripts/
│   └── initDatabase.js     # DB initialization script
├── index.js                # Main server file
├── .env                    # Environment variables (gitignored)
├── .env.example            # Environment template
└── package.json
```

## 🔌 API Endpoints

### Authentication (Public)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User (Protected)
- `GET /api/user/profile` - Get user profile
- `GET /api/user/dashboard` - Get dashboard stats

### Playlists (Protected)
- `GET /api/playlists` - Get all user playlists
- `POST /api/playlists` - Create playlist
- `GET /api/playlists/:id` - Get playlist details
- `PUT /api/playlists/:id` - Update playlist
- `DELETE /api/playlists/:id` - Delete playlist
- `POST /api/playlists/:id/songs` - Add song to playlist
- `DELETE /api/playlists/:id/songs/:songId` - Remove song

### Playlist Sharing (Public)
- `GET /api/shared/:token` - Get shared playlist

### Favorites (Protected)
- `GET /api/favorites` - Get all favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/:trackId` - Remove from favorites
- `GET /api/favorites/check/:trackId` - Check if favorited

### History (Protected)
- `GET /api/history` - Get listening history
- `POST /api/history` - Add to history
- `GET /api/history/recent` - Get recently played
- `DELETE /api/history` - Clear history

### Songs (Public)
- `GET /api/search?term=query` - Search songs
- `GET /api/songs/trending` - Get trending songs

### Health Check
- `GET /api/health` - Check API and database status

## 🔐 Authentication

### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Use Token
Include the JWT token in the Authorization header for protected routes:

```bash
GET /api/playlists
Authorization: Bearer <your_jwt_token>
```

## 🗄️ Database Schema

### Users
- id (Primary Key)
- name
- email (Unique)
- password (Hashed with bcrypt)
- created_at, updated_at

### Playlists
- id (Primary Key)
- user_id (Foreign Key)
- name
- description
- is_public
- share_token (for public playlists)
- created_at, updated_at

### Playlist Songs
- id (Primary Key)
- playlist_id (Foreign Key)
- track_id
- track_name
- artist_name
- artwork_url
- preview_url
- added_at

### Favorites
- id (Primary Key)
- user_id (Foreign Key)
- track_id
- track_name, artist_name, artwork_url, preview_url
- added_at

### Listening History
- id (Primary Key)
- user_id (Foreign Key)
- track_id
- track_name, artist_name, artwork_url, preview_url
- played_at

## 🧪 Testing

```bash
# Test database connection
npm run init-db

# Test API health
curl http://localhost:5000/api/health

# Register a test user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'
```

## 🔧 Troubleshooting

### Database Connection Issues
1. Ensure PostgreSQL is running:
   ```bash
   # Windows
   pg_ctl status
   
   # Mac/Linux
   sudo systemctl status postgresql
   ```

2. Check credentials in `.env` file
3. Verify database exists:
   ```bash
   psql -U postgres -c "\l"
   ```

### Port Already in Use
```bash
# Change PORT in .env file or kill the process
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

## 🚀 Deployment

### Heroku
```bash
heroku create your-app-name
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set JWT_SECRET=your_secret_here
git push heroku main
```

### Railway
```bash
railway login
railway init
railway add
railway up
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use secure `JWT_SECRET` (minimum 32 characters)
- Configure `FRONTEND_URL` with your production domain
- Enable SSL for database connection

## 📚 Technologies Used

- **Express.js** - Web framework
- **PostgreSQL** - Database
- **pg** - PostgreSQL client
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **dotenv** - Environment variables
- **axios** - HTTP client (for iTunes API)
- **cors** - Cross-origin resource sharing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License

## 👨‍💻 Author

Your Name

## 🔗 Links

- Frontend Repository: [Link]
- Live Demo: [Link]
- API Documentation: [Link]
