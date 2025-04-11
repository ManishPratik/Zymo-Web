const twilio = require("twilio");
const MessagingResponse = require("twilio").twiml.MessagingResponse;
const dotenv = require("dotenv").config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const whatsapp_messaging_service_id = process.env.TWILIO_WHATSAPP_SERVICE_ID;

const send_whatsapp_message_booking_confirm_template_id =
  process.env.WHATSAPP_TEMPLATE_BOOKING_CONFIRM;
const send_whatsapp_message_booking_confirm_vendor_template_id =
  process.env.WHATSAPP_TEMPLATE_BOOKING_CONFIRM_VENDOR;
const send_whatsapp_message_refund_template_id =
  process.env.WHATSAPP_TEMPLATE_REFUND;
const send_whatsapp_message_booking_cancel_template_id =
  process.env.WHATSAPP_TEMPLATE_BOOKING_CANCEL;
const send_whatsapp_message_test_drive_booking_confirm_template_id =
  process.env.WHATSAPP_TEMPLATE_TEST_DRIVE_BOOKING_CONFIRM;
const send_whatsapp_message_extended_test_drive_booking_confirm_template_id =
  process.env.WHATSAPP_TEMPLATE_EXTENDED_TEST_DRIVE_BOOKING_CONFIRM;

const client = twilio(accountSid, authToken);

//Whatsapp message to user(when vendor is zoomcar)
async function sendWhatsAppMessageWhenZoomCarVendor(data) {
  // console.log("Data Came",data);

  try {
    const response = await client.messages.create({
      from: whatsapp_messaging_service_id, // WhatsApp Messaging Service ID
      to: `whatsapp:${data.phone}`, // Dynamic recipient
      contentSid: send_whatsapp_message_booking_confirm_template_id, // Template ID
      contentVariables: JSON.stringify({
        1: data.customerName, // Customer Name
        2: `${data.model}-${data.transmission}`, // Car Name and Transmission Type
        3: data.pickupLocation, // Pick-up Location
        4: data.id, // Booking ID
        5: data.freeKMs, // Free KMs
        6: data.startDate, // Start Date
        7: data.endDate, // End Date
        8: data.city, // City
        9: data.phone, // Phone Number
      }),
    });
    // console.log("Response to user:",response)
    console.log(
      `Booking confirmation message sent to ${data.phone}: ${response.sid}`
    );
  } catch (error) {
    console.error(`Failed to send WhatsApp message: ${error.message}`);
  }
}

//Whatsapp message to zymo(when vendor is zoomcar)
async function sendWhatsAppMessageWhenZoomCarVendorToZymo(data) {
  console.log("Data Came", data);
  try {
    const response = await client.messages.create({
      from: whatsapp_messaging_service_id, // WhatsApp Messaging Service ID
      to: `whatsapp:+919987933348`, // Dynamic recipient
      contentSid: send_whatsapp_message_booking_confirm_template_id, // Template ID
      contentVariables: JSON.stringify({
        1: data.customerName, // Customer Name
        2: `${data.model}-${data.transmission}`, // Car Name and Transmission Type
        3: data.pickupLocation, // Pick-up Location
        4: data.id, // Booking ID
        5: data.freeKMs, // Free KMs
        6: data.startDate, // Start Date
        7: data.endDate, // End Date
        8: data.city, // City
        9: data.phone, // Phone Number
      }),
    });
    // console.log("Response to user:",response)
    console.log(
      `Booking confirmation message sent to +919987933348: ${response.sid}`
    );
  } catch (error) {
    console.error(`Failed to send WhatsApp message: ${error.message}`);
  }
}

//Whatsapp message to user(for other vendors)
async function sendWhatsAppMessageWhenOtherVendor(data) {
  try {
    const response = await client.messages.create({
      from: whatsapp_messaging_service_id, // WhatsApp Messaging Services ID
      to: `whatsapp:${data.phone}`,
      contentSid: send_whatsapp_message_booking_confirm_vendor_template_id, // Template ID
      contentVariables: JSON.stringify({
        1: data.customerName, // Customer Name
        2: data.city,
        3: `${data.model}-${data.transmission}`, // Car Name and Transmission Type
        4: data.id, // Booking ID
        5: data.vendorName, // Vendor Name
        6: data.phone, // Mobile Number
        7: data.email, // Email ID
        8: data.serviceType, // Service Type
        9: data.city, // City
        10: data.pickupLocation,
        11: data.startDate, // Start Date & Time
        12: data.endDate, // End Date & Time
        13: data.amount, // Amount
        14: data.dateOfBirth, // Date of Birth
        15: data.package, // Package
        16: data.paymentMode, // Payment Mode
        17: data.vendorLocation, // Vendor Location
      }),
    });

    console.log(
      `Vendor Booking Message sent to ${data.phone}: ${response.sid}`
    );
  } catch (error) {
    console.error(`Failed to send vendor booking message: ${error.message}`);
  }
}

//Whatsapp message to zymo(for other vendors)
async function sendWhatsAppMessageWhenOtherVendorToZymo(data) {
  try {
    const response = await client.messages.create({
      from: whatsapp_messaging_service_id, // WhatsApp Messaging Services ID
      to: `whatsapp:+919987933348`,
      contentSid: send_whatsapp_message_booking_confirm_vendor_template_id, // Template ID
      contentVariables: JSON.stringify({
        1: data.customerName, // Customer Name
        2: `${data.model}-${data.transmission}`, // Car Name and Transmission Type
        3: data.pickupLocation, // Pick-up Location
        4: data.id, // Booking ID
        5: data.vendorName, // Vendor Name
        6: data.phone, // Mobile Number
        7: data.email, // Email ID
        8: data.serviceType, // Service Type
        9: data.city, // City
        10: data.startDate, // Start Date & Time
        11: data.endDate, // End Date & Time
        12: data.amount, // Amount
        13: data.dateOfBirth, // Date of Birth
        14: data.package, // Package
        15: data.paymentMode, // Payment Mode
        16: data.vendorLocation, // Vendor Location
      }),
    });

    console.log(
      `Vendor Booking Message sent to ${data.phone}: ${response.sid}`
    );
  } catch (error) {
    console.error(`Failed to send vendor booking message: ${error.message}`);
  }
}

//Refund Message Function
async function sendRefundMessage(data) {
  try {
    const response = await client.messages.create({
      from: whatsapp_messaging_service_id, //WhatsApp Messaging Service ID
      to: `whatsapp:${data.phone}`, // "whatsapp:+917517442597",
      contentSid: send_whatsapp_message_refund_template_id, // Template ID
      contentVariables: JSON.stringify({
        1: data.customerName, // Customer Name
        2: data.id, // Booking ID
        3: `${data.model}-${data.transmission}`, // Car Name and Transmission Type
      }),
    });

    console.log(`Refund Message sent to ${data.phone}: ${response.sid}`);
  } catch (error) {
    console.error(`Failed to send refund message: ${error.message}`);
  }
}

//Booking cancel Message
async function bookingCancelMessage(data) {
  try {
    const response = await client.messages.create({
      from: whatsapp_messaging_service_id, // WhatsApp Messaging Service ID
      to: `whatsapp:${data.phone}`, // Dynamic recipient
      contentSid: send_whatsapp_message_booking_cancel_template_id, // Template ID
      contentVariables: JSON.stringify({
        1: data.customerName, // Customer Name
        2: data.id, // Booking ID
        3: data.location, // Location
        4: data.model, // Car Name
      }),
    });

    console.log(
      `Booking cancellation message sent to ${data.phone}: ${response.sid}`
    );
  } catch (error) {
    console.error(
      `Failed to send booking cancellation message: ${error.message}`
    );
  }
}

//Whatsapp Confirmation message for test drive
async function sendTestDriveWhatsappMessage(data) {
  try {
    const response = await client.messages.create({
      from: whatsapp_messaging_service_id, // WhatsApp Messaging Service ID
      to: `whatsapp:${data.phone}`, // Dynamic recipient
      contentSid: send_whatsapp_message_test_drive_booking_confirm_template_id, // Template ID (HX6e55153f6a739a31a3d8b1b5b612620e)
    });

    console.log(
      `Booking confirmation message sent to ${data.phone}: ${response.sid}`
    );
  } catch (error) {
    console.error(
      `Failed to send booking confirmation message: ${error.message}`
    );
  }
}

//Whatsapp message for Extended test drive
async function sendExtendedTestDriveWhatsappMessage(data) {
  try {
    const response = await client.messages.create({
      from: whatsapp_messaging_service_id, // WhatsApp Messaging Service ID
      to: `whatsapp:${data.phone}`, // Dynamic recipient
      contentSid:
        send_whatsapp_message_extended_test_drive_booking_confirm_template_id, // Template ID
      contentVariables: JSON.stringify({
        1: data.userName, // Customer Name
        2: data.carModel, // Car Model
        3: data.carName, // Car Name
        4: data.startDate, // Start date
        5: data.endDate, // End Date
        6: data.bookingId, // Booking Id
      }),
    });

    console.log(
      `Booking cancellation message sent to ${data.phone}: ${response.sid}`
    );
  } catch (error) {
    console.error(
      `Failed to send booking cancellation message: ${error.message}`
    );
  }
}

module.exports = {
  sendWhatsAppMessageWhenZoomCarVendor,
  sendWhatsAppMessageWhenOtherVendor,
  sendWhatsAppMessageWhenZoomCarVendorToZymo,
  sendWhatsAppMessageWhenOtherVendorToZymo,
  sendRefundMessage,
  bookingCancelMessage,
  sendTestDriveWhatsappMessage,
  sendExtendedTestDriveWhatsappMessage,
};

//Dummy JSON for Booking Confirmation Message
// {
//    "customerName": "John Doe",
//    "model": "Sedan",
//    "transmission": "Automatic",
//    "pickupLocation": "Airport Terminal 1 , new twon , garden near ...",
//    "bookingId": "ABC12345",
//    "freeKMs": "100",
//    "startDate": "2025-02-15",
//    "endDate": "2025-02-20",
//    "city": "Ghaziabad",
//    "phone": "+917517442597"
//  }

// Dummy JSON for Vendor Booking
// {
//      "customerName": "John Doe",
//      "model": "Sedan",
//      "transmission": "Automatic",
//      "pickupLocation": "Airport Terminal 1 , new twon , garden near ...",
//      "id": "ABC12345",
//      "vendorName": "Zymo Rentals",
//      "mobileNumber": "+917517442597",
//      "email": "johndoe@example.com",
//      "serviceType": "Self Drive",
//      "city": "Ghaziabad",
//      "startDateTime": "2025-02-15 10:00 AM",
//      "endDateTime": "2025-02-20 06:00 PM",
//      "amount": "₹5000",
//      "dateOfBirth": "1990-05-12",
//      "package": "Unlimited KMs Package",
//      "paymentMode": "Online Payment",
//      "vendorLocation": "Zymo Hub, Ghaziabad",
//      "phone": "+917517442597"
// }

// Dummy JSON for Refund Message
// {
//      "customerName": "John Doe",
//      "id": "ABC12345",
//      "model": "Sedan",
//      "phone": "+917517442597"
//  }

// Dummy JSON for Booking Cancellation Message
// {
//    "customerName": "John Doe",
//    "id": "ABC12345",
//    "pickupLocation": "Airport Terminal 1",
//    "model": "Sedan",
//    "phone": "+917517442597"
//  }
