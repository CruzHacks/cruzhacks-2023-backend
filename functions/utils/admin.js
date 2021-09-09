const admin = require("firebase-admin");
admin.initializeApp();
db = admin.firestore();
storage = admin.storage();

module.exports = { db, storage };
