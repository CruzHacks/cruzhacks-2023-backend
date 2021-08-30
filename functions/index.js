const functions = require("firebase-functions");
const { app } = require("./controllers/auth/index");
const { verifyRecaptcha } = require("./controllers/VerifyRecaptcha/index");

exports.auth = functions.https.onRequest(app);

exports.verifyRecaptcha = functions.https.onRequest(verifyRecaptcha);
