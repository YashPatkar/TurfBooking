// ======================
// VIEWS (BACKEND LOGIC + APIS + AUTH)
// ======================
const express = require("express");
const bcrypt = require("bcrypt");
const { User, Turf, Booking, Payment } = require("./models");

const router = express.Router();

// ======================
// AUTH ROUTES
// ======================
router.post("/signup", async (req, res) => {
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

router.post("/login", async (req, res) => {
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

router.post("/logout", (req, res) => {
  delete req.session.user;
  res.json({ success: true });
});

router.get("/api/user", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const user = await User.findOne({
      where: { email: req.session.user.email },
      attributes: ["email", "phone"]
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      user: {
        email: user.email,
        phone: user.phone,
        name: user.email.split("@")[0]
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

// ======================
// ADMIN VERIFICATION
// ======================
router.post("/api/verify-admin-password", (req, res) => {
  try {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return res.status(500).json({ 
        success: false, 
        error: "Admin password not configured" 
      });
    }

    if (password === adminPassword) {
      res.json({ success: true });
    } else {
      res.json({ 
        success: false, 
        error: "Invalid password" 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: "Verification failed" 
    });
  }
});

// ======================
// USER ROUTES
// ======================
router.get("/api/users", async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "email", "phone", "createdAt"]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.delete("/api/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const deleted = await User.destroy({ where: { id: userId } });
    res.json({ success: !!deleted });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// ======================
// TURF ROUTES
// ======================
router.get("/get-turfs", async (req, res) => {
  try {
    const turfs = await Turf.findAll();
    res.json(turfs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch turfs" });
  }
});

router.post("/add-turf", async (req, res) => {
  try {
    const { name, image, address, game, price, timing } = req.body;
    await Turf.create({ name, image, address, game, price, timing });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to add turf" });
  }
});

// ======================
// BOOKING ROUTES
// ======================
router.get("/api/bookings", async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      order: [["bookingDate", "DESC"]]
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

router.get("/api/user-bookings", async (req, res) => {
  try {
    const userPhone = req.query.phone;
    const bookings = await Booking.findAll({
      where: { userPhone },
      order: [["bookingDate", "DESC"]]
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user bookings" });
  }
});

router.post("/api/bookings", async (req, res) => {
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
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Booking failed" });
  }
});

router.put("/api/bookings/:id/status", async (req, res) => {
  try {
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
    console.error("Error updating booking status:", error);
    res.status(500).json({ error: "Failed to update status" });
  }
});

router.delete("/api/bookings/:id", async (req, res) => {
  try {
    const bookingId = req.params.id;
    const deleted = await Booking.destroy({ where: { id: bookingId } });
    res.json({ success: !!deleted });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete booking" });
  }
});

// ======================
// PAYMENT ROUTES
// ======================
router.post("/api/payments", async (req, res) => {
  try {
    const {
      bookingId, userName, userPhone, turfName,
      amount, paymentMethod, cardNumber, cardHolderName
    } = req.body;

    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const payment = await Payment.create({
      bookingId,
      userName,
      userPhone,
      turfName,
      amount,
      paymentMethod: paymentMethod || "card",
      cardNumber: cardNumber.replace(/\s/g, "").slice(-4),
      cardHolderName,
      status: "completed",
      transactionId
    });

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

router.get("/api/payments", async (req, res) => {
  try {
    const payments = await Payment.findAll({
      order: [["createdAt", "DESC"]],
      include: [{
        model: Booking,
        attributes: ["id", "bookingDate", "fromTime", "toTime"]
      }]
    });
    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

router.get("/api/payments/:bookingId", async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const payment = await Payment.findOne({
      where: { bookingId },
      include: [{
        model: Booking,
        attributes: ["id", "bookingDate", "fromTime", "toTime"]
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

const registerViews = (app) => {
  app.use("/", router);
};

module.exports = { registerViews };
