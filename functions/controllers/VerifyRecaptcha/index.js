const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const { base_google_endpoint, secretKey } = require("../../utils/config");
const { corsConfig } = require("../../utils/config");
const fetch = require("isomorphic-fetch");

const verifyRecaptcha = express();
const corsOptions = {
  origin: corsConfig,
  optionsSuccessStatus: 200,
};
verifyRecaptcha.use(cors(corsOptions));
verifyRecaptcha.use(express.json());

verifyRecaptcha.post("/submit", async (req, res) => {
  // Logic to process case of no g-recaptcha-response
  functions.logger.log(req.body);
  if (Object.keys(req.body).includes("captcha")) {
    if (req.body.captcha === undefined || req.body.captcha === "" || req.body.captcha === null) {
      return res.status(401).send({ error: true, status: 401, message: "Please select captcha" });
    }
    const formBody = `secret=${secretKey}&response=${req.body.captcha}&remoteip=${req.socket.remoteAddress}`;

    await fetch(base_google_endpoint, {
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody,
    })
      .then((response) => response.json())
      .then((g_response) => {
        functions.logger.log("response data", g_response);
        if (Object.keys(g_response).includes("success")) {
          // make sure we have valid response object
          if (g_response.success) {
            return res.status(200).send({ error: false, status: 200, message: "Successfully Validated Request" });
          } else {
            // if success === false: we respond to each type of error
            if (Object.keys(g_response).includes("error-codes")) {
              const errors = g_response["error-codes"];

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
      })
      .catch((error) => res.status(500).send({ error: true, status: 500, message: error.message }));
  } else {
    return res.status(401).send({ error: true, status: 401, message: "Unauthorized request" });
  }
});

module.exports = { verifyRecaptcha };
