// ======================
// 1. REQUIRED MODULES
// ======================
const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const cors = require("cors");

// ======================
// 2. APP CONFIGURATION
// ======================
const app = express();
const PORT = 4000;

// ======================
// 3. MIDDLEWARE SETUP
// ======================
app.use(cors({
  origin: 'http://localhost:4000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "src")));

app.use(session({
  secret: "supersecretkey",
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// ======================
// 4. DATABASE CONFIGURATION
// ======================
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.db",
});

// ======================
// 5. MODEL DEFINITIONS
// ======================
const User = sequelize.define("User", {
  email: { 
    type: DataTypes.STRING, 
    allowNull: false,
    unique: true
  },
  phone: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true 
  },
  password: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
});

const Turf = sequelize.define("Turf", {
  name: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  image: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  address: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  game: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  price: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  timing: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
});

const Booking = sequelize.define("Booking", {
  userName: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  userPhone: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  turfName: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  turfImage: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  turfAddress: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  turfGame: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  bookingDate: { 
    type: DataTypes.DATEONLY, 
    allowNull: false 
  },
  fromTime: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  toTime: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  price: { 
    type: DataTypes.FLOAT, 
    allowNull: false 
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "pending",
    validate: {
      isIn: [["pending", "confirmed", "cancelled"]]
    }
  }
});

const Payment = sequelize.define("Payment", {
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userPhone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  turfName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "card"
  },
  cardNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cardHolderName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "completed",
    validate: {
      isIn: [["completed", "failed", "pending"]]
    }
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
});

// ======================
// 6. MODEL RELATIONSHIPS
// ======================
Turf.hasMany(Booking);
Booking.belongsTo(Turf);
Booking.hasOne(Payment, { foreignKey: 'bookingId' });
Payment.belongsTo(Booking, { foreignKey: 'bookingId' });

// ======================
// 7. DATABASE SYNC
// ======================
sequelize.sync().then(() => {
  console.log("Database synced!");
}).catch(err => {
  console.error("Database sync error:", err);
});

// ======================
// 8. HTML ROUTES
// ======================
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "src", "index.html")));
app.get("/signup", (req, res) => res.sendFile(path.join(__dirname, "src", "signup.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "src", "login.html")));
app.get("/main", (req, res) => res.sendFile(path.join(__dirname, "src", "main.html")));
app.get("/admin", (req, res) => res.sendFile(path.join(__dirname, "src", "admin.html")));
app.get("/users", (req, res) => res.sendFile(path.join(__dirname, "src", "user_data.html")));
app.get("/bookings", (req, res) => res.sendFile(path.join(__dirname, "src", "bookings.html")));
app.get("/payment", (req, res) => res.sendFile(path.join(__dirname, "src", "payment.html")));
app.get("/payments", (req, res) => res.sendFile(path.join(__dirname, "src", "payments.html")));

// ======================
// 9. API ROUTES
// ======================

// User Routes
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

// Turf Routes
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

// Booking Routes
app.get("/api/bookings", async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      order: [['bookingDate', 'DESC']]
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

app.get("/api/user-bookings", async (req, res) => {
  try {
    const userPhone = req.query.phone;
    const bookings = await Booking.findAll({
      where: { userPhone },
      order: [['bookingDate', 'DESC']]
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user bookings" });
  }
});

app.post("/api/bookings", async (req, res) => {
  try {
    const { 
      turfName, turfImage, turfAddress, turfGame,
      userName, userPhone, bookingDate, 
      fromTime, toTime, price 
    } = req.body;
    
    const booking = await Booking.create({
      turfName, turfImage, turfAddress, turfGame,
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
    console.log(error);
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Booking failed" });
  }
});

app.put("/api/bookings/:id/status", async (req, res) => {
  try {
    console.log("Updating booking status...");
    console.log("Request body:", req.body);
    console.log("Request params:", req.params);
    const bookingId = req.params.id;
    const { status } = req.body;
    
    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const [updated] = await Booking.update(
      { status },
      { where: { id: bookingId } }
    );
    
    if (updated) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Booking not found" });
    }
  } catch (error) {
    console.log('-------------')
    console.error("Error updating booking status:", error);
    res.status(500).json({ error: "Failed to update status" });
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

// Payment Routes
app.post("/api/payments", async (req, res) => {
  try {
    const { 
      bookingId, userName, userPhone, turfName,
      amount, paymentMethod, cardNumber, cardHolderName
    } = req.body;
    
    // Generate a unique transaction ID
    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    const payment = await Payment.create({
      bookingId,
      userName,
      userPhone,
      turfName,
      amount,
      paymentMethod: paymentMethod || "card",
      cardNumber: cardNumber.replace(/\s/g, '').slice(-4), // Store only last 4 digits
      cardHolderName,
      status: "completed",
      transactionId
    });
    
    // Update booking status to confirmed after payment
    await Booking.update(
      { status: "confirmed" },
      { where: { id: bookingId } }
    );
    
    res.json({ success: true, payment });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ error: "Payment failed" });
  }
});

app.get("/api/payments", async (req, res) => {
  try {
    const payments = await Payment.findAll({
      order: [['createdAt', 'DESC']],
      include: [{
        model: Booking,
        attributes: ['id', 'bookingDate', 'fromTime', 'toTime']
      }]
    });
    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

app.get("/api/payments/:bookingId", async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const payment = await Payment.findOne({
      where: { bookingId },
      include: [{
        model: Booking,
        attributes: ['id', 'bookingDate', 'fromTime', 'toTime']
      }]
    });
    
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    
    res.json(payment);
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({ error: "Failed to fetch payment" });
  }
});

// Auth Routes
app.post("/signup", async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, phone, password: hashedPassword });
    
    req.session.user = {
      email: user.email,
      phone: user.phone
    };
    
    res.json({ 
      success: true, 
      phone: user.phone 
    });
  } catch (error) {
    res.status(500).json({ error: "Signup failed" });
  }
});

// Add this to your API routes section
app.post('/logout', (req, res) => {
  // Simply delete the user data from session
  delete req.session.user;
  res.json({ success: true });
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

app.get("/api/user", async (req, res) => {
  try {
    if (!req.session.user) {
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
        name: user.email.split('@')[0]
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

// ======================
// 10. ERROR HANDLING
// ======================
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// ======================
// 11. SERVER START
// ======================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});