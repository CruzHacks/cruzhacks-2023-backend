const functions = require("firebase-functions");
const fetch = require("node-fetch");
const { db } = require("../../utils/admin");

const getM2MToken = () => {
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
};

exports.getM2MToken = getM2MToken;

// const retrieveM2M = functions.pubsub.schedule("0 0 * * *").onRun((context) => );
