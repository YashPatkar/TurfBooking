// ======================
// APPLICATION SETTINGS
// ======================

const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || "supersecretkey";
const CORS_ORIGIN = process.env.CORS_ORIGIN || `http://localhost:${PORT}`;

const sessionConfig = {
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
};

const corsOptions = {
  origin: CORS_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

module.exports = {
  PORT,
  SESSION_SECRET,
  CORS_ORIGIN,
  sessionConfig,
  corsOptions
};
