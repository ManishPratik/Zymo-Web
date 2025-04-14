const { defineSecret } = require("firebase-functions/params");
const Razorpay = require("razorpay");

// Razorpay prod/test mode toggle
const prod = true;

const RAZORPAY_TEST_KEY = defineSecret("RAZORPAY_TEST_KEY");
const RAZORPAY_TEST_KEY_SECRET = defineSecret("RAZORPAY_TEST_KEY_SECRET");
const RAZORPAY_PROD_KEY = defineSecret("RAZORPAY_PROD_KEY");
const RAZORPAY_PROD_KEY_SECRET = defineSecret("RAZORPAY_PROD_KEY_SECRET");

function getRazorpayInstance() {
  return new Razorpay({
    key_id: prod
      ? process.env.RAZORPAY_PROD_KEY || RAZORPAY_PROD_KEY.value()
      : process.env.RAZORPAY_TEST_KEY || RAZORPAY_TEST_KEY.value(),
    key_secret: prod
      ? process.env.RAZORPAY_PROD_KEY_SECRET || RAZORPAY_PROD_KEY_SECRET.value()
      : process.env.RAZORPAY_TEST_KEY_SECRET ||
        RAZORPAY_TEST_KEY_SECRET.value(),
  });
}

module.exports = { getRazorpayInstance };
