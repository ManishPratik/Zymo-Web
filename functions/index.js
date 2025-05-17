const functions = require("firebase-functions/v2");
const express = require("express");
const cors = require("cors");

// Import the pre-initialized admin instance
const { admin } = require("./config/firebase-admin");
//import the email functions 
const { sendAcknowledgmentEmail, sendRejectionEmail } = require('./config/email.js');

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

// HTTP function for acknowledgement email
exports.sendEmailOnFormSubmit = functions.https.onRequest(async (req, res) => {
  console.log("Request method:", req.method);
  console.log("Request body:", req.body);

  if (req.method !== "POST") {
    console.log("Method not allowed:", req.method);
    return res.status(405).send("Method Not Allowed");
  }

  const { email, fullName } = req.body;
  if (!email || !fullName) {
    console.log("Missing required fields:", { email, fullName });
    return res.status(400).send("Missing required fields: email, fullName");
  }

  try {
    const subject = "Application Received - Zymo";
    const text = `Dear ${fullName},\n\nThank you for submitting your application at Zymo. We have received it and will review it shortly. You’ll hear from us shortly via the contact details you provided.\n\nBest regards,\nTeam Zymo`;
    await sendAcknowledgmentEmail(email, subject, text);
    console.log("Email sent successfully to:", email);
    res.status(200).send("Email sent successfully");
  } catch (error) {
    console.error("Failed to send email:", error.message, error.stack);
    res.status(500).send("Failed to send email");
  }
});

// HTTP function for rejection email 
exports.sendRejectionEmail = functions.https.onRequest(async (req, res) => {
  console.log("Request method:", req.method);
  console.log("Request body:", req.body);

  if (req.method !== "POST") {
    console.log("Method not allowed:", req.method);
    return res.status(405).send("Method Not Allowed");
  }

  const { email, fullName, jobType } = req.body;
  if (!email || !fullName) {
    console.log("Missing required fields:", { email, fullName, jobType });
    return res.status(400).send("Missing required fields: email, fullName");
  }

  try {
    const subject = "Application Status - Zymo";
    const text = `Dear ${fullName},\n\nThank you for your interest in the ${jobType || "[Job Title]"} position at Zymo.\n\nAfter careful consideration of all applications, we regret to inform you that we will not be moving forward with your candidacy at this time.\n\nThis decision is not a reflection of your qualifications or potential. We received an exceptionally high number of applications for a limited number of roles, making the selection process very competitive.\n\nWe sincerely appreciate the time and effort you invested in applying to Zymo. We encourage you to keep an eye on our careers page and apply for any future openings that align with your skills and experience. \n\nWe wish you the very best in your job search and future career endeavors.\n\nBest regards,\nTeam Zymo`;
    await sendRejectionEmail(email, subject, text);
    console.log("Rejection email sent successfully to:", email);
    res.status(200).send("Rejection email sent successfully");
  } catch (error) {
    console.error("Failed to send rejection email:", error.message, error.stack);
    res.status(500).send("Failed to send rejection email");
  }
});

// Import routes
const zoomcarRoutes = require("./routes/zoomcarAPI");
const paymentRoutes = require("./routes/paymentAPI");
const messageRoutes = require("./routes/messageAPI");
const mychoizeRoutes = require("./routes/mychoizeAPI");
const otpRoutes = require("./routes/otpAPI");

// Configure routes
app.use("/zoomcar", zoomcarRoutes);
app.use("/payment", paymentRoutes);
app.use("/message", messageRoutes);
app.use("/mychoize", mychoizeRoutes);
app.use("/otp", otpRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ message: "API is running smoothly!" });
});

// Export the API
exports.api = functions.https.onRequest(app);
