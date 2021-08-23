const functions = require("firebase-functions");
const { helloWorld } = require("./controllers/helloworld/index");
const { app } = require("./controllers/expressExample/index");
const { getM2MToken } = require("./controllers/retrieveM2MToken/index");
exports.helloWorld = functions.https.onRequest(helloWorld);

exports.auth = functions.https.onRequest(app);

// Cloud function that runs every day at 12:00a.m. Retrieves the M2M from Auth0 and stores the token in a firestore collection.
exports.retrieveM2M = functions.pubsub.schedule("0 0 * * *").onRun((context) => getM2MToken());
