const fetch = require("node-fetch");
const { issuer, client_id, client_secret } = require("../../utils/config");

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
      res.json().then((data) => {
        return data.access_token;
      });
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
};

module.exports = { getM2MToken };
