const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const { defineSecret } = require("firebase-functions/params");

const EMAIL_USER = defineSecret("EMAIL_USER");
const EMAIL_PASS = defineSecret("EMAIL_PASS");

// Retrieve email credentials from process.env
const emailUser = process.env.EMAIL_USER || EMAIL_USER.value();
const emailPass = process.env.EMAIL_PASS || EMAIL_PASS.value();

console.log('Email User:', emailUser); 
console.log('Email Pass:', emailPass); 

// Validate credentials
if (!emailUser || !emailPass) {
  throw new Error('Email credentials (EMAIL_USER and EMAIL_PASS) must be set in .env file for local development or in Firebase environment variables for deployment.');
}

// Configure Nodemailer with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  secure: false, // true for 465, false for 587 with TLS
  auth: {
    user: emailUser,
    pass: emailPass, // Use environment variable if available
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP verification failed:', error);
  } else {
    console.log('SMTP server is ready to take our messages');
  }
});

// Function to send an acknowledgment email (unchanged)
const sendAcknowledgmentEmail = async (to, subject, text) => {
  console.log('Sending email to:', to);
  const mailOptions = {
    from: emailUser,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', to);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Throw error to be handled by the caller
  }
};

// New function to send rejection email
const sendRejectionEmail = async (to, subject, text) => {
  console.log('Sending rejection email to:', to);
  const mailOptions = {
    from: emailUser,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Rejection email sent successfully to:', to);
  } catch (error) {
    console.error('Error sending rejection email:', error);
    throw error; // Throw error to be handled by the caller
  }
};

module.exports = { sendAcknowledgmentEmail, sendRejectionEmail };