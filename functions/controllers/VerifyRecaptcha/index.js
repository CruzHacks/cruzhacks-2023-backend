const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const fetch = require("isomorphic-fetch");

const recaptchaConfig = functions.config().verify_recaptcha;
const auth0Config = functions.config().auth;
const app = functions.config().app;

const apikey = app ? app.apikey : "";

const validKey = (req, res, next) => {
  if (!req.headers.authentication || req.headers.authentication !== apikey || apikey === "") {
    return res.status(403).send({ message: "Invalid Api Key" });
  }
  next();
};

const base_google_endpoint = recaptchaConfig ? recaptchaConfig.base_google_endpoint : "";
const secretKey = recaptchaConfig ? recaptchaConfig.secret_key : "";
const corsConfig = auth0Config ? auth0Config.cors : "";

const verifyRecaptcha = express();

verifyRecaptcha.disable("x-powered-by");

const corsOptions = {
  origin: corsConfig,
  optionsSuccessStatus: 200,
};
verifyRecaptcha.use(cors(corsOptions));
verifyRecaptcha.use(express.json());

verifyRecaptcha.post("/submit", validKey, async (req, res) => {
  // Logic to process case of no g-recaptcha-response
  if (Object.keys(req.headers).includes("token")) {
    const token = req.headers.token;
    const formBody = `secret=${secretKey}&response=${token}&remoteip=${req.socket.remoteAddress}`;

    return fetch(base_google_endpoint, {
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody,
    })
      .then((response) => response.json())
      .then((g_response) => {
        if (Object.keys(g_response).includes("success")) {
          // make sure we have valid response object
          if (g_response.success) {
            return res.status(200).send({ error: false, status: 200, message: "Successfully Validated Request" });
          } else {
            // if success === false: we respond to each type of error
            if (Object.keys(g_response).includes("error-codes")) {
              const errors = g_response["error-codes"];
              functions.logger.log("Unable to validate g-response token", {
                error: errors,
                remoteip: req.socket.remoteAddress,
              });
              if (errors.includes("invalid-input-response") && errors.includes("invalid-input-secret")) {
                return res.status(400).send({ error: true, status: 400, message: "Invalid Token or Secret" });
              } else if (errors.includes("invalid-input-response")) {
                return res.status(400).send({ error: true, status: 400, message: "Invalid Token" });
              } else if (errors.includes("invalid-input-secret")) {
                return res.status(401).send({ error: true, status: 401, message: "Invalid Secret" });
              } else if (errors.includes("timeout-or-duplicate")) {
                return res
                  .status(400)
                  .send({ error: true, status: 400, message: "Request timed out, or Duplicate key" });
              }
            }
          }
        }
        // returning a status 500 really shouldn't occur: in this case something needs attention
        functions.logger.error("Unable to validate g-response token", {
          error: "siteVerify response did not include a success field. Ensure the siteVerify URI is correct",
        });
        return res.status(500).send({ error: true, status: 500, message: "Internal service error" });
      })
      .catch((error) => {
        functions.logger.error("Error occurred with fetch when attempting to validate g-response token", {
          error: error,
        });
        return res.status(500).send({ error: true, status: 500, message: error.message });
      });
  } else {
    functions.logger.log("Unable to validate g-response token", {
      error: "bad request",
      remoteip: req.socket.remoteAddress,
    });
    return res.status(400).send({ error: true, status: 400, message: "Bad request, missing data in headers" });
  }
});

const service = functions.https.onRequest(verifyRecaptcha);

module.exports = { verifyRecaptcha, service, validKey };
