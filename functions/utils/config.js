const functions = require("firebase-functions");

const auth0Config = functions.config().auth;
const client_vars = functions.config().client_vars;
const recaptchaConfig = functions.config().verify_recaptcha;
const app = functions.config().app;

const corsConfig = auth0Config ? auth0Config.cors : "";
const audience = auth0Config ? auth0Config.audience : "";
const issuer = auth0Config ? auth0Config.issuer : "";
const jwk_uri = auth0Config ? auth0Config.jwk_uri + ".well-known/jwks.json" : ".well-known/jwks.json";
const client_id = client_vars ? client_vars.client_id : "";
const client_secret = client_vars ? client_vars.client_secret : "";
const base_google_endpoint = recaptchaConfig ? recaptchaConfig.base_google_endpoint : "";
const secretKey = recaptchaConfig ? recaptchaConfig.secret_key : "";
const apikey = app ? app.apikey : "";

module.exports = {
  corsConfig,
  audience,
  issuer,
  jwk_uri,
  client_id,
  client_secret,
  base_google_endpoint,
  secretKey,
  apikey,
};
