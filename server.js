const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "src")));
app.use(session({
  secret: "supersecretkey",
  resave: false,
  saveUninitialized: true,
  cookie: { 
      secure: false, // Set to true if using HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Database Setup
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.db",
});

// Define Models
const User = sequelize.define("User", {
  email: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
});

const Turf = sequelize.define("Turf", {
  name: { type: DataTypes.STRING, allowNull: false },
  image: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false },
  game: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.INTEGER, allowNull: false },
  timing: { type: DataTypes.STRING, allowNull: false },
});

const Booking = sequelize.define("Booking", {
  userName: { type: DataTypes.STRING, allowNull: false },
  userPhone: { type: DataTypes.STRING, allowNull: false },
  bookingDate: { type: DataTypes.DATEONLY, allowNull: false },
  fromTime: { type: DataTypes.STRING, allowNull: false },
  toTime: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  status: {
    type: DataTypes.STRING,
    defaultValue: "pending",
    validate: {
      isIn: [["pending", "confirmed", "cancelled"]]
    }
  }
});

// Define Relationships
Turf.hasMany(Booking);
Booking.belongsTo(Turf);

// Sync Database
sequelize.sync().then(() => console.log("Database synced!"));

// HTML Routes
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "src", "index.html")));
app.get("/signup", (req, res) => res.sendFile(path.join(__dirname, "src", "signup.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "src", "login.html")));
app.get("/main", (req, res) => res.sendFile(path.join(__dirname, "src", "main.html")));
app.get("/admin", (req, res) => res.sendFile(path.join(__dirname, "src", "admin.html")));
app.get("/users", (req, res) => res.sendFile(path.join(__dirname, "src", "user_data.html")));
app.get("/bookings", (req, res) => res.sendFile(path.join(__dirname, "src", "bookings.html")));

// API Routes
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'phone', 'createdAt']
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const deleted = await User.destroy({ where: { id: userId } });
    res.json({ success: !!deleted });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Add this to your server.js in the API Routes section
// Add this to your server.js in the API Routes section
app.get("/api/user-bookings", async (req, res) => {
  try {
    const userPhone = req.query.phone;
    const bookings = await Booking.findAll({
      where: { userPhone },
      include: [{
        model: Turf,
        attributes: ['id', 'name', 'image', 'address', 'game'], // Ensure these exist
        required: false // Makes the join LEFT JOIN instead of INNER JOIN
      }],
      order: [['bookingDate', 'DESC']]
    });

    // Filter out bookings with null Turf (if any)
    const validBookings = bookings.filter(booking => booking.Turf !== null);
    
    res.json(validBookings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user bookings" });
  }
});

app.get("/get-turfs", async (req, res) => {
  try {
    const turfs = await Turf.findAll();
    res.json(turfs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch turfs" });
  }
});

app.post("/add-turf", async (req, res) => {
  try {
    const { name, image, address, game, price, timing } = req.body;
    await Turf.create({ name, image, address, game, price, timing });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to add turf" });
  }
});

app.get("/api/bookings", async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [{
        model: Turf,
        attributes: ['name']
      }],
      order: [['bookingDate', 'DESC']]
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

app.post("/api/bookings", async (req, res) => {
  try {
    const { turfId, userName, userPhone, bookingDate, fromTime, toTime, price } = req.body;
    
    const booking = await Booking.create({
      turfId,
      userName,
      userPhone,
      bookingDate,
      fromTime,
      toTime,
      price,
      status: "pending"
    });
    
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ error: "Booking failed" });
  }
});

app.delete("/api/bookings/:id", async (req, res) => {
  try {
    const bookingId = req.params.id;
    const deleted = await Booking.destroy({ where: { id: bookingId } });
    res.json({ success: !!deleted });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete booking" });
  }
});

// Update the signup route
// Signup route
app.post("/signup", async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        error: "User already exists",
        phone: null
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, phone, password: hashedPassword });
    
    res.json({ 
      success: true, 
      phone: user.phone // Send phone directly
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: "Signup failed",
      phone: null
    });
  }
});

app.post("/login", async (req, res) => {
  try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
          return res.status(401).json({ error: "Invalid password" });
      }

      // Set session data
      req.session.user = {
          email: user.email,
          phone: user.phone
      };
      
      res.json({ 
          success: true, 
          phone: user.phone 
      });
  } catch (error) {
      res.status(500).json({ error: "Login failed" });
  }
});

// Add this right after your other route definitions (before the error handler)
app.get("/api/user", async (req, res) => {
  try {
      if (!req.session.user || !req.session.user.email) {
          return res.status(401).json({ error: "Not logged in" });
      }

      const user = await User.findOne({
          where: { email: req.session.user.email },
          attributes: ['email', 'phone']
      });

      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }

      res.json({
          success: true,
          user: {
              email: user.email,
              phone: user.phone,
              name: user.email.split('@')[0] // Generate name from email
          }
      });
  } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: "Failed to fetch user data" });
  }
});

// Make sure this comes BEFORE your 404 error handler
app.use((req, res) => {
  res.status(404).send("Page not found");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});