// ======================
// HTML PAGE ROUTES
// ======================
const express = require("express");
const path = require("path");

const router = express.Router();

// ======================
// AUTH MIDDLEWARE
// ======================
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect("/login");
};

const isNotAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return res.redirect("/main");
  }
  next();
};

// ======================
// PUBLIC ROUTES
// ======================
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "public", "index.html"));
});

// Auth Routes (redirect to main if already logged in)
router.get("/signup", isNotAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "src", "public", "signup.html"));
});

router.get("/login", isNotAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "src", "public", "login.html"));
});

// ======================
// PROTECTED USER ROUTES (require login)
// ======================
router.get("/main", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "src", "user", "main.html"));
});

router.get("/payment", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "src", "user", "payment.html"));
});

router.get("/user_bookings", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "src", "user", "user_bookings.html"));
});

router.get("/feedback", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "src", "user", "feedback.html"));
});

// ======================
// PROTECTED ADMIN ROUTES (require login)
// ======================
router.get("/admin", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "src", "admin", "admin.html"));
});

router.get("/users", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "src", "admin", "user_data.html"));
});

router.get("/bookings", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "src", "admin", "bookings.html"));
});

router.get("/payments", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "src", "admin", "payments.html"));
});

const registerViews = (app) => {
  app.use("/", router);
};

module.exports = { registerViews };
