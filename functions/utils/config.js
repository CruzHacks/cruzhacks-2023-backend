const functions = require("firebase-functions");

const auth0Config = functions.config().auth;

const corsConfig = auth0Config ? auth0Config.cors : "";
const audience = auth0Config ? auth0Config.audience : "";
const issuer = auth0Config ? auth0Config.issuer : "";
const jwk_uri = auth0Config ? auth0Config.jwk_uri + ".well-known/jwks.json" : ".well-known/jwks.json";

module.exports = { corsConfig, audience, issuer, jwk_uri };
