const functions = require("firebase-functions");
const { helloWorld } = require("./controllers/helloworld/index");
const { app } = require("./controllers/expressExample/index");
const { verifyRecaptcha } = require("./controllers/VerifyRecaptcha/index");

exports.helloWorld = functions.https.onRequest(helloWorld);

exports.auth = functions.https.onRequest(app);

exports.verifyRecaptcha = functions.https.onRequest(verifyRecaptcha);
