const express = require("express");
const axios = require("axios");
const router = express.Router();
const { getTwoFactorConfig } = require("../config/twofactor.js");
const { admin } = require("../config/firebase-admin"); 

// Get API key from config
const { apiKey: API_KEY } = getTwoFactorConfig();

// The rest of the admin initialization code is no longer needed as we're using the centralized instance
// Just log that we're using the centralized admin instance
console.log("OTP API using the centralized Firebase Admin instance");

router.post("/send", async (req, res) => {
  const { phone } = req.body;

  if (!API_KEY) {
    return res.status(500).json({
      success: false,
      error: "API key for 2Factor is not configured",
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
      if (!formattedPhone.startsWith("+")) {
        formattedPhone = formattedPhone.startsWith("91")
          ? "+" + formattedPhone
          : "+91" + formattedPhone;
      }

      let customToken;
      let userId;

      try {
        let userRecord;
        try {
          let searchNumbers = [
            formattedPhone,
            formattedPhone.slice(1),
            formattedPhone.slice(2),
            formattedPhone.slice(3),
          ];

          console.log("Searching for phone numbers:", searchNumbers);

          // First check in Firestore
          let firestoreRecord = await admin
            .firestore()
            .collection("users")
            .where("mobileNumber", "in", searchNumbers)
            .get();

          if (firestoreRecord.empty) {
            // If not found in mobileNumber field, try phone field
            firestoreRecord = await admin
              .firestore()
              .collection("users")
              .where("phone", "in", searchNumbers)
              .get();
          }

          if (!firestoreRecord.empty) {
            // User found in Firestore
            userId = firestoreRecord.docs[0].id;
            console.log("Found existing user in Firestore:", userId);

            // Check if user exists in Auth
            try {
              userRecord = await admin.auth().getUser(userId);
            } catch (authError) {
              // User exists in Firestore but not in Auth, create Auth user
              userRecord = await admin.auth().createUser({
                uid: userId,
                phoneNumber: formattedPhone,
              });
            }
          } else {
            // Try to get user from Auth
            try {
              userRecord = await admin
                .auth()
                .getUserByPhoneNumber(formattedPhone);
              userId = userRecord.uid;
              console.log("Found existing user in Auth:", userId);

              // User exists in Auth but not in Firestore, add to Firestore
              await admin.firestore().collection("users").doc(userId).set({
                mobileNumber: formattedPhone,
                createdAt: new Date(),
              });
            } catch (authError) {
              // User doesn't exist anywhere, create new user
              console.log(
                "Creating new user with phone number:",
                formattedPhone
              );
              userRecord = await admin.auth().createUser({
                phoneNumber: formattedPhone,
              });
              userId = userRecord.uid;

              // Store user details in Firestore
              await admin.firestore().collection("users").doc(userId).set({
                mobileNumber: formattedPhone,
                createdAt: new Date(),
              });
            }
          }
        } catch (error) {
          console.error("Error handling user:", error);
          throw error;
        }

        // Generate custom token for the user
        customToken = await admin.auth().createCustomToken(userId);
        console.log("Generated custom token for user:", userId);

        res.json({
          success: true,
          verified: true,
          customToken,
          userId,
        });
      } catch (tokenError) {
        console.error("Firebase authentication error:", tokenError);
        res.status(500).json({
          success: false,
          error: "Authentication failed: " + tokenError.message,
        });
      }
    } else {
      res.json({
        success: false,
        verified: false,
        error: "Invalid OTP",
      });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({
      success: false,
      error: "Failed to verify OTP: " + error.message,
    });
  }
});

module.exports = router;
