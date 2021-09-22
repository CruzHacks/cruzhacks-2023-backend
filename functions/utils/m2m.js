const fetch = require("node-fetch");

const getM2MToken = (client_id, client_secret, issuer) => {
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
      return res.json();
    })
    .then((data) => {
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
