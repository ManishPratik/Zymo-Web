// Firebase Admin initialization with service account
const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");
const { defineSecret } = require("firebase-functions/params");

// Define the service account secret for production
const SERVICE_ACCOUNT_KEY_JSON_STRING = defineSecret(
  "SERVICE_ACCOUNT_KEY_JSON_STRING"
);

function initializeAdmin() {
  if (!admin.apps.length) {
    try {
      // For development: try to use local service account file
      const serviceAccountPath = path.join(
        __dirname,
        "keys",
        "serviceAccountKey.json"
      );
      if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = require(serviceAccountPath);
        const app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log(
          "Firebase Admin initialized with local service account credentials"
        );
        return app;
      }

      // For production: use the Firebase secret
      try {
        const serviceAccountJson = JSON.parse(
          SERVICE_ACCOUNT_KEY_JSON_STRING.value()
        );
        const app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccountJson),
        });
        console.log(
          "Firebase Admin initialized with service account from secret"
        );
        return app;
      } catch (secretError) {
        console.error("Failed to initialize with secret:", secretError);
        // Fall back to default credentials as last resort
        const app = admin.initializeApp();
        console.log("Firebase Admin initialized with default credentials");
        return app;
      }
    } catch (error) {
      console.error("Failed to initialize Firebase Admin:", error);
      const app = admin.initializeApp();
      console.log(
        "Firebase Admin initialized with default credentials after error"
      );
      return app;
    }
  }
  return admin.apps[0];
}

const adminApp = initializeAdmin();

module.exports = {
  admin,
  adminApp,
};
