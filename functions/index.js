const functions = require("firebase-functions/v2");
const express = require("express");
const cors = require("cors");
// Import the pre-initialized admin instance
const { admin } = require("./config/firebase-admin");

// Import routes
const zoomcarRoutes = require("./routes/zoomcarAPI");
const paymentRoutes = require("./routes/paymentAPI");
const messageRoutes = require("./routes/messageAPI");
const mychoizeRoutes = require("./routes/mychoizeAPI");
const otpRoutes = require("./routes/otpAPI");
const emailRoutes = require("./routes/emailAPI.js");

const app = express();

// Configure middleware
app.use(cors({ origin: true }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure routes
app.use("/zoomcar", zoomcarRoutes);
app.use("/payment", paymentRoutes);
app.use("/message", messageRoutes);
app.use("/mychoize", mychoizeRoutes);
app.use("/otp", otpRoutes);
app.use("/email", emailRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ message: "API is running smoothly!" });
});

// Export the API
exports.api = functions.https.onRequest(app);
