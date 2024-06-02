const admin = require("firebase-admin");
const serviceAccount = require("./firebase-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://intrepid-memory-402711.appspot.com",
});

const bucket = admin.storage().bucket();

module.exports = { bucket };
