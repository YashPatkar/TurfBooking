# Project Structure Documentation

## Overview
The Turf Booking System backend has been refactored into multiple modular files for better maintainability and organization. All backend files are located at the root level for easy access.

## File Structure

```
TurfBooking/
├── server.js           # Main entry point - orchestrates all modules
├── database.js         # Database connection and sync functions
├── models.js           # All database models (User, Turf, Booking, Payment)
├── settings.js         # Application configuration and settings
├── views.js            # API routes and backend logic
├── htmlRoutes.js       # HTML page serving routes
├── .env                # Environment variables (PORT, ADMIN_PASSWORD, etc.)
├── package.json        # Project dependencies
└── src/                # Frontend files
    ├── admin/          # Admin panel HTML files
    │   ├── admin.html
    │   ├── user_data.html
    │   ├── bookings.html
    │   └── payments.html
    ├── user/           # User-facing HTML files
    │   ├── main.html
    │   ├── payment.html
    │   ├── user_bookings.html
    │   └── feedback.html
    ├── public/         # Public HTML files
    │   ├── index.html
    │   ├── login.html
    │   └── signup.html
    ├── input.css       # Tailwind input
    └── output.css      # Tailwind output
```

## File Descriptions

### 🚀 server.js
**Main Entry Point**
- Imports all modules
- Sets up Express application
- Registers all routes
- Handles errors
- Starts the server

### 💾 database.js
**Database Management**
- Sequelize configuration
- SQLite connection setup
- Database connection testing
- Database synchronization

### 📊 models.js
**Data Models**
- User model (authentication)
- Turf model (venue information)
- Booking model (reservations)
- Payment model (transactions)
- Model relationships

### ⚙️ settings.js
**Configuration Settings**
- Port configuration (default: 4000)
- Session secrets
- CORS settings
- Environment variables via dotenv
- Session configuration
- CORS options

### 🔐 views.js
**API Routes & Backend Logic**
- POST /signup - User registration
- POST /login - User login
- POST /logout - User logout
- GET /api/user - Get current user
- POST /api/verify-admin-password - Admin password verification
- GET /api/users - Get all users
- DELETE /api/users/:id - Delete user
- GET /get-turfs - Get all turfs
- POST /add-turf - Add new turf
- GET /api/bookings - Get all bookings
- GET /api/user-bookings - Get user-specific bookings
- POST /api/bookings - Create new booking
- PUT /api/bookings/:id/status - Update booking status
- DELETE /api/bookings/:id - Delete booking
- POST /api/payments - Create payment
- GET /api/payments - Get all payments
- GET /api/payments/:bookingId - Get payment by booking ID

### 📄 htmlRoutes.js
**HTML Page Routes**

**Public Routes:**
- GET / - Landing page (src/public/index.html)
- GET /signup - Signup page (src/public/signup.html)
- GET /login - Login page (src/public/login.html)

**User Routes (require authentication):**
- GET /main - Main turf browsing page (src/user/main.html)
- GET /payment - Payment processing (src/user/payment.html)
- GET /user_bookings - User's bookings (src/user/user_bookings.html)
- GET /feedback - Feedback form (src/user/feedback.html)

**Admin Routes (require authentication):**
- GET /admin - Admin panel with turf form (src/admin/admin.html)
- GET /users - User management (src/admin/user_data.html)
- GET /bookings - Bookings management (src/admin/bookings.html)
- GET /payments - Payments management (src/admin/payments.html)

## How to Run

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=4000
   SESSION_SECRET=supersecretkey
   CORS_ORIGIN=http://localhost:4000
   ADMIN_PASSWORD=admin123
   ```

3. **Start the Server**
   ```bash
   npm run dev
   ```
   This will concurrently run:
   - Node.js server (server.js)
   - Tailwind CSS watch mode

4. **Access the Application**
   - Open browser and navigate to: `http://localhost:4000`

## Benefits of This Structure

✅ **Modularity** - Each file has a single responsibility
✅ **Maintainability** - Easy to find and update specific features
✅ **Scalability** - New routes/features can be added easily
✅ **Readability** - Clear separation of concerns
✅ **Debugging** - Easier to isolate and fix issues
✅ **Team Collaboration** - Multiple developers can work on different files

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=4000
SESSION_SECRET=supersecretkey
CORS_ORIGIN=http://localhost:4000
ADMIN_PASSWORD=admin123
```

**Variable Descriptions:**
- `PORT` - Server port (default: 4000)
- `SESSION_SECRET` - Secret key for session encryption
- `CORS_ORIGIN` - Allowed origin for CORS
- `ADMIN_PASSWORD` - Admin panel access password

## Database

- **Type**: SQLite
- **File**: `database.db`
- **Location**: Root directory
- **Auto-created**: Yes, on first run

## Notes for Developers

- HTML files are organized by role (admin, user, public)
- Backend routes are consolidated in views.js
- Models are defined using Sequelize ORM
- Session management uses express-session
- CORS is enabled for localhost
- Database syncs automatically on startup
- Environment variables loaded via dotenv
- Admin password verification uses API endpoint
- Authentication middleware protects routes

## Future Enhancements

Consider adding:
- Input validation middleware
- Rate limiting
- API documentation (Swagger)
- Logging system
- Unit tests
- Environment-specific configs
