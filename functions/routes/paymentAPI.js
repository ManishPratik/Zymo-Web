const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { getRazorpayInstance } = require("../config/razorpay.js");

router.post("/create-order", async (req, res) => {
  try {
    const { amount, currency } = req.body;
    if (!amount || !currency) {
      return res.status(400).json({
        success: false,
        message: "Amount and currency is required.",
      });
    }
    const options = {
      amount: amount * 100,
      currency: currency,
      receipt: `receipt_order_${crypto.randomBytes(10).toString("hex")}`,
      payment_capture: 1,
    };
    const razorpay = getRazorpayInstance();
    const response = await razorpay.orders.create(options);
    if (response) {
      res.status(200).json({
        success: true,
        data: response,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Order creation failed",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
});

//Verifying the payment
router.post("/verifyPayment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order ID, payment ID, and signature are required.",
      });
    }
    const key_secret = process.env.RAZORPAY_PROD_KEY_SECRET;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(sign.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // TODO: Log payments
      // logPayments(
      //     `Payment ID: ${razorpay_payment_id}, Order ID: ${razorpay_order_id}`
      // );
      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
      });
    } else {
      console.log("Invalid payment signature");
      return res.status(400).json({
        success: false,
        error: "Invalid payment signature",
      });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error: Could not verify payment",
      error: error.message,
    });
  }
});

router.post("/refund", async (req, res) => {
  try {
    const { payment_id } = req.body;
    if (!payment_id) {
      return res.status(400).json({
        success: false,
        message: "Payment ID is required.",
      });
    }
    const razorpay = getRazorpayInstance();
    const refund = await razorpay.payments.refund(payment_id);

    if (refund) {
      res.status(200).json({
        success: true,
        data: refund,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Refund failed.",
      });
    }
  } catch (error) {
    console.error("Error initiating refund:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error: Could not initiate refund",
      error: error.message,
    });
  }
});

module.exports = router;
