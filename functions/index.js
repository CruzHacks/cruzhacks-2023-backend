const functions = require("firebase-functions");
const {helloWorld} = require("./controllers/helloworld/index")


exports.helloWorld = functions.https.onRequest(helloWorld);

