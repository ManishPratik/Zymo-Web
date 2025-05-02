const express = require("express");
const axios = require("axios");
const router = express.Router();
const { getTwoFactorConfig } = require("../config/twofactor.js");
const admin = require("firebase-admin");
const fs = require('fs');
const path = require('path');

// Get API key from config
const { apiKey: API_KEY } = getTwoFactorConfig();

// Initialize Firebase Admin with service account if available
try {
  const serviceAccountPath = path.join(__dirname, '../config/keys/serviceAccountKey.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin initialized with service account credentials');
    }
  } else {
    console.warn('Service account file not found. Firebase Admin will use default credentials or mock authentication.');
    if (!admin.apps.length) {
      admin.initializeApp();
    }
  }
} catch (error) {
  console.warn('Error initializing Firebase Admin with service account:', error.message);
  if (!admin.apps.length) {
    admin.initializeApp();
  }
}

router.post("/send", async (req, res) => {
  const { phone } = req.body;
  
  if (!API_KEY) {
    return res.status(500).json({
      success: false,
      error: "API key for 2Factor is not configured"
    });
  }

  try {
    const response = await axios.get(
      `https://2factor.in/API/V1/${API_KEY}/SMS/${phone}/AUTOGEN`
    );

    res.json({
      success: true,
      sessionId: response.data.Details,
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send OTP",
    });
  }
});

router.post("/verify", async (req, res) => {
  const { sessionId, otp, phone } = req.body;

  if (otp.length !== 6 || !otp) {
    return res.status(400).json({
      success: false,
      error: "Invalid OTP length",
    });
  }

  try {
    const response = await axios.get(
      `https://2factor.in/API/V1/${API_KEY}/SMS/VERIFY/${sessionId}/${otp}`
    );

    // Handle expired OTP case
    if (
      response.data.Status === "Error" &&
      response.data.Details === "OTP Expired"
    ) {
      return res.status(400).json({
        success: false,
        error: "OTP has expired. Please request a new one.",
        expired: true,
      });
    }

    if (response.data.Status === "Success") {
      // OTP verification successful, now create or get Firebase user
      
      // Format phone number to E.164 format
      let formattedPhone = phone;
      // If phone number doesn't start with '+', prepend it with India's country code
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = formattedPhone.startsWith('91') 
          ? '+' + formattedPhone 
          : '+91' + formattedPhone;
      }
      
      let customToken;
      let userId;
      
      try {
        let userRecord;
        
        try {
          // Try to get existing user by phone number
          userRecord = await admin.auth().getUserByPhoneNumber(formattedPhone);
          userId = userRecord.uid;
          console.log("Found existing user with phone number:", formattedPhone);
        } catch (authError) {
          // If user doesn't exist, create a new one
          console.log("Creating new user with phone number:", formattedPhone);
          userRecord = await admin.auth().createUser({
            phoneNumber: formattedPhone,
          });
          userId = userRecord.uid;
        }
        
        // Generate custom token for the user
        customToken = await admin.auth().createCustomToken(userId);
        console.log("Generated custom token for user:", userId);
        
        res.json({
          success: true,
          verified: true,
          customToken,
          userId
        });
      } catch (tokenError) {
        console.error("Firebase authentication error:", tokenError);
        res.status(500).json({
          success: false,
          error: "Authentication failed: " + tokenError.message
        });
      }
    } else {
      res.json({
        success: false,
        verified: false,
        error: "Invalid OTP"
      });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({
      success: false,
      error: "Failed to verify OTP: " + error.message
    });
  }
});

module.exports = router;
