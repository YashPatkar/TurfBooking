const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");
const bcrypt = require("bcrypt"); // For password hashing
const session = require("express-session"); // For user sessions
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static(path.join(__dirname, "src"))); // ✅ Serving from `src/`
app.use(express.static(path.join(__dirname, "src"))); // Serve HTML
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: true,
  })
);

// Database Setup
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.db",
});

// Define User Model
const User = sequelize.define("User", {
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  phone: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
});

// Define Turf Model (For Admin to Add)
const Turf = sequelize.define("Turf", {
  name: { type: DataTypes.STRING, allowNull: false },
  image: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false },
  game: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.INTEGER, allowNull: false },
  timing: { type: DataTypes.STRING, allowNull: false },
});

// Sync Database
sequelize.sync().then(() => console.log("Database synced!"));

// Routes
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "src", "index.html")));
app.get("/signup", (req, res) => res.sendFile(path.join(__dirname, "src", "signup.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "src", "login.html")));
app.get("/main", (req, res) => res.sendFile(path.join(__dirname, "src", "main.html")));
app.get("/admin", (req, res) => res.sendFile(path.join(__dirname, "src", "admin.html")));

// ✅ SIGNUP LOGIC
app.post("/signup", async (req, res) => {
  const { email, phone, password } = req.body;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.send("Error: User already exists!");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ email, phone, password: hashedPassword });

  req.session.user = email;
  res.redirect("/main");
});

// ✅ LOGIN LOGIC
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.send("Error: User does not exist!");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.send("Error: Incorrect password!");
  }

  req.session.user = email;
  res.redirect("/main");
});

// ✅ ADMIN - ADD TURF
app.post("/add-turf", async (req, res) => {
  const { name, image, address, game, price, timing } = req.body;

  await Turf.create({ name, image, address, game, price, timing });
  res.send("Turf added successfully!");
});

// ✅ GET TURFS (Show on `main.html`)
app.get("/get-turfs", async (req, res) => {
  const turfs = await Turf.findAll();
  res.json(turfs);
});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));