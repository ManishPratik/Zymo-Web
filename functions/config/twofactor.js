const { defineSecret } = require("firebase-functions/params");

const TWOFACTOR_API_KEY = defineSecret("TWOFACTOR_API_KEY");

function getTwoFactorConfig() {
  return {
    apiKey: process.env.TWOFACTOR_API_KEY || TWOFACTOR_API_KEY.value()
  };
}

module.exports = { getTwoFactorConfig };
