// ======================
// TURF BOOKING SYSTEM - MAIN SERVER FILE
// ======================

// Load environment variables
require("dotenv").config();

// ======================
// 1. IMPORT MODULES
// ======================
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const settings = require("./settings");
const { connectDatabase, syncDatabase } = require("./database");
require("./models");

const { registerViews: registerBackendViews } = require("./views");
const { registerViews } = require("./htmlRoutes");

// ======================
// 2. INITIALIZE APP
// ======================
const app = express();

// ======================
// 3. MIDDLEWARE CONFIGURATION
// ======================
app.use(cors(settings.corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "src")));
app.use(session(settings.sessionConfig));

// ======================
// 4. CONNECT DATABASE
// ======================
connectDatabase();
syncDatabase();

// ======================
// 5. REGISTER ROUTES + VIEWS
// ======================
registerViews(app);
registerBackendViews(app);

// ======================
// 6. ERROR HANDLING
// ======================
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.path,
    method: req.method
  });
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    error: message,
    stack: err.stack
  });
});

// ======================
// 7. START SERVER
// ======================
app.listen(settings.PORT, () => {
  console.log("=".repeat(50));
  console.log("TURF BOOKING SYSTEM SERVER");
  console.log("=".repeat(50));
  console.log(`Server running on http://localhost:${settings.PORT}`);
  console.log("=".repeat(50));
});