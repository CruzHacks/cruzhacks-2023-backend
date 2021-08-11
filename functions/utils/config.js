const functions = require("firebase-functions");

const auth0Config = functions.config().auth;
const jwk_uri = auth0Config.issuer + ".well-known/jwks.json";

module.exports = { auth0Config, jwk_uri };
