const admin = require("firebase-admin");
admin.initializeApp();
db = admin.firestore();

module.exports = { db }