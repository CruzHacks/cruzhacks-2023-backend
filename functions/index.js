const functions = require("firebase-functions");
const firebase = require("firebase-admin");
const { helloWorld } = require("./controllers/helloworld/index");
const { app } = require("./controllers/expressExample/index");
const fetch = require("node-fetch");
const { db } = require("./utils/admin");

exports.helloWorld = functions.https.onRequest(helloWorld);

exports.auth = functions.https.onRequest(app);

// Cloud function that runs every day at 12:00a.m. Retrieves the M2M from Auth0 and stores the token in a firestore collection
exports.retrieveM2M = functions.pubsub.schedule("0 0 * * *").onRun((context) => {
  options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: functions.config().client.client_id,
      client_secret: functions.config().client.client_secret,
      audience: "https://cruzhacks.us.auth0.com/api/v2/",
      grant_type: "client_credentials",
    }),
  };
  fetch("https://cruzhacks.us.auth0.com/oauth/token", options).then((res) => {
    res.json().then((data) => {
      db.collection("tokencol").doc("token").set({
        access_token: data.access_token,
      });
    });
  });
  return null;
});
