const express = require("express");
const router = express.Router()


//import the email functions 
const { sendAcknowledgmentEmail, sendRejectionEmail } = require('../config/email.js');


// Route for sending acknowledgment email 
router.post("/sendEmailOnFormSubmit", async (req, res) => {
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
    const text = `Dear ${fullName},\n\nThank you for submitting your application at Zymo. We have received it and will review it shortly. You’ll hear from us shortly via the contact details you provided.\n\nBest regards,\nThe Zymo Team. \n\nThis is a system generated email do not reply to this`;
    await sendAcknowledgmentEmail(email, subject, text);
    console.log("Email sent successfully to:", email);
    res.status(200).send("Email sent successfully");
  } catch (error) {
    console.error("Failed to send email:", error.message, error.stack);
    res.status(500).send("Failed to send email");
  }
});

// Route for sending rejection email 
router.post("/sendRejectionEmail", async (req, res) => {
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
    const text = `Dear ${fullName},\n\nThank you for your interest in the ${jobType || "[Job Title]"} position at Zymo. After careful consideration of all applications, we regret to inform you that we will not be moving forward with your candidacy at this time. This decision is not a reflection of your qualifications or potential. We received an exceptionally high number of applications for a limited number of roles, making the selection process very competitive.\nWe sincerely appreciate the time and effort you invested in applying to Zymo. We encourage you to keep an eye on our careers page and apply for any future openings that align with your skills and experience. We wish you the very best in your job search and future career endeavors.\n\nBest regards,\nThe Zymo Team. \n\nThis is a system generated email do not reply to this`;
    await sendRejectionEmail(email, subject, text);
    console.log("Rejection email sent successfully to:", email);
    res.status(200).send("Rejection email sent successfully");
  } catch (error) {
    console.error("Failed to send rejection email:", error.message, error.stack);
    res.status(500).send("Failed to send rejection email");
  }
});
module.exports = router;
