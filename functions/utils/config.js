const functions = require("firebase-functions");

const auth0Config = functions.config().auth;
const recaptchaConfig = functions.config().verifyRecaptcha;

const corsConfig = auth0Config ? auth0Config.cors : "";
const audience = auth0Config ? auth0Config.audience : "";
const issuer = auth0Config ? auth0Config.issuer : "";
const jwk_uri = auth0Config ? auth0Config.jwk_uri + ".well-known/jwks.json" : ".well-known/jwks.json";

const base_google_endpoint = recaptchaConfig ? recaptchaConfig.base_google_endpoint : "";
const secretKey = recaptchaConfig ? recaptchaConfig.secretKey : "";

module.exports = { corsConfig, audience, issuer, jwk_uri, base_google_endpoint, secretKey };
