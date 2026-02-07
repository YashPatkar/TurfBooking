// ======================
// DATABASE MODELS
// ======================
const { DataTypes } = require("sequelize");
const { sequelize } = require("./database");

// User Model
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

// Turf Model
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

// Booking Model
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

// Payment Model
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
// MODEL RELATIONSHIPS
// ======================
Turf.hasMany(Booking);
Booking.belongsTo(Turf);
Booking.hasOne(Payment, { foreignKey: 'bookingId' });
Payment.belongsTo(Booking, { foreignKey: 'bookingId' });

module.exports = { User, Turf, Booking, Payment };
