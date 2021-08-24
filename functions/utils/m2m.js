const fetch = require("node-fetch");
const functions = require("firebase-functions");

const { issuer, client_id, client_secret } = require("./config");
const getM2MToken = () => {
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
  console.log(options);
  return fetch(`${issuer}oauth/token`, options)
    .then((res) => {
      //console.log(res)
      return res.json();
    })
    .then((data) => {
      //console.log(data)
      return data.access_token;
    })
    .catch((err) => {
      functions.logger.log(`Error: ${err}`);
      return "";
    });
};

module.exports = { getM2MToken };
