// ======================
// DATABASE CONNECTION
// ======================
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.db",
  logging: false
});

// Test database connection
const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("✓ Database connection established successfully");
  } catch (error) {
    console.error("✗ Unable to connect to database:", error);
  }
};

// Sync database
const syncDatabase = async () => {
  try {
    await sequelize.sync();
    console.log("✓ Database synced successfully");
  } catch (error) {
    console.error("✗ Database sync error:", error);
  }
};

module.exports = { sequelize, connectDatabase, syncDatabase };
