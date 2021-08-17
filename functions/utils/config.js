const functions = require("firebase-functions");

const auth0Config = functions.config().auth;
const api = functions.config().api;

const corsConfig = auth0Config ? auth0Config.cors : "";
const audience = auth0Config ? auth0Config.audience : "";
const issuer = auth0Config ? auth0Config.issuer : "";
const jwk_uri = auth0Config ? auth0Config.jwk_uri + ".well-known/jwks.json" : ".well-known/jwks.json";

const api_token = api ? api.api_token : "";
const api_url = api ? api.url : "";
module.exports = { corsConfig, audience, issuer, jwk_uri, api_token, api_url };
