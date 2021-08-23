const functions = require("firebase-functions");
const fetch = require("node-fetch");
const { db } = require("../../utils/admin");
const { issuer, client_id, client_secret } = require("../../utils/config");

const writeToken = (token) => {
  db.collection("tokencol").doc("token").set({
    token: token,
  });
};

const getM2MToken = (context) => {
  options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: client_id,
      client_secret: client_secret,
      audience: `${issuer}api/v2/`,
      grant_type: "client_credentials",
    }),
  };
  fetch(`${issuer}oauth/token`, options)
    .then((res) => {
      res.json().then((data) => {
        writeToken(data.access_token);
        return true;
      });
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
};

exports.getM2MToken = getM2MToken;
