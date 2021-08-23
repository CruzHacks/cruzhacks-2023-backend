const functions = require("firebase-functions");
const { helloWorld } = require("./controllers/helloworld/index");
const { app } = require("./controllers/expressExample/index");
const { getM2MToken } = require("./controllers/retrieveM2MToken/index");
exports.helloWorld = functions.https.onRequest(helloWorld);

exports.auth = functions.https.onRequest(app);
