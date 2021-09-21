const fetch = require("node-fetch");
const functions = require("firebase-functions");

const client_vars = functions.config().client_vars;
const auth0Config = functions.config().auth;

const client_id = client_vars ? client_vars.client_id : "";
const client_secret = client_vars ? client_vars.client_secret : "";
const issuer = auth0Config ? auth0Config.issuer : "";

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
      functions.logger.error("Error occurred while fetching M2M token", {
        error: err,
      });
      return "";
    });
};

module.exports = { getM2MToken };
