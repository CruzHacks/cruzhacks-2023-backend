const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const { jwtCheck } = require("../../utils/middleware");
const { getM2MToken } = require("../../utils/m2m");

const auth0Config = functions.config().auth;

const corsConfig = auth0Config ? auth0Config.cors : "";
const issuer = auth0Config ? auth0Config.issuer : "";

const app = express();
app.disable("x-powered-by");
app.use(express.json());

const api_url = issuer + "api/v2/";

const corsOptions = {
  origin: corsConfig,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.post("/resend", jwtCheck, async (req, res) => {
  // this endpoint takes in a user_id then converts
  // it into an API call
  try {
    const auth0Config = functions.config().auth;
    const client_vars = functions.config().client_vars;
    const issuer = auth0Config ? auth0Config.issuer : "";
    const client_id = client_vars ? client_vars.client_id : "";
    const client_secret = client_vars ? client_vars.client_secret : "";

    const token = await getM2MToken(client_id, client_secret, issuer);
    const checkIfVerifiedOptions = {
      // options for the API call
      // to see if email is already verified
      method: "GET",
      url: api_url + "users/" + req.user.sub,
      headers: { authorization: "Bearer " + token },
    };

    const checkIfVerified = await axios(checkIfVerifiedOptions); // send request
    if (checkIfVerified.data.email_verified) {
      throw "Email Already Verified";
    }

    const sendVerificationEmail = {
      // options for the API call
      // to make call to auth0 server
      method: "POST",
      url: api_url + "jobs/verification-email",
      headers: { authorization: "Bearer " + token },
      data: {
        user_id: req.user && req.user.sub ? req.user.sub : "",
      },
    };

    // make API call then response
    const verificationEmailRes = await axios(sendVerificationEmail);
    if (verificationEmailRes.status === 201) {
      res.status(201).send({ code: 201, message: "Verification Email Sent" });
    } else {
      throw "Could not Send";
    }
  } catch (err) {
    if (err === "Email Already Verified") {
      functions.logger.log("Could not resend verification email", {
        error: err,
        user: req.user.sub,
      });
      res.status(406).send({ code: 406, message: "Email Already Verified" });
    } else {
      functions.logger.error("Could not resend verification email", {
        error: err,
        user: req.user.sub,
      });
      res.status(500).send({ code: 500, message: "Unable to Send Verification Email" });
    }
  }
});

app.patch("/metadata", jwtCheck, async (req, res) => {
  try {
    const validThemes = /light|dark/;
    const theme = req.body.theme;
    functions.logger.info(`PATCH request to metadata made with theme: ${theme}`);
    if (!theme || !theme.match(validThemes)) {
      res.status(400).send({ code: 400, message: "invalid request body" });
    } else {
      const auth0Config = functions.config().auth;
      const client_vars = functions.config().client_vars;
      const issuer = auth0Config ? auth0Config.issuer : "";
      const client_id = client_vars ? client_vars.client_id : "";
      const client_secret = client_vars ? client_vars.client_secret : "";

      const token = await getM2MToken(client_id, client_secret, issuer);
      const options = {
        method: "PATCH",
        url: api_url + "users/" + req.user.sub,
        headers: {
          authorization: "Bearer " + token,
          "content-type": "application/json",
        },
        data: {
          user_metadata: {
            theme: theme,
          },
        },
      };
      const patchMetadataRes = await axios(options);
      if (patchMetadataRes.status === 200) {
        res.status(200).send({ code: 200, message: "metadata update success" });
      } else {
        const retStatus = patchMetadataRes.status;
        res.status(retStatus).send({ code: retStatus, message: "unable to update metadata" });
      }
    }
  } catch (err) {
    res.status(500).send({ status: 500 });
  }
});

app.get("/metadata", jwtCheck, async (req, res) => {
  try {
    functions.logger.info(`Get user metadata request received`);
    const auth0Config = functions.config().auth;
    const client_vars = functions.config().client_vars;
    const issuer = auth0Config ? auth0Config.issuer : "";
    const client_id = client_vars ? client_vars.client_id : "";
    const client_secret = client_vars ? client_vars.client_secret : "";
    const token = await getM2MToken(client_id, client_secret, issuer);

    const options = {
      // options for the API call
      method: "GET",
      url: api_url + "users/" + req.user.sub,
      headers: { authorization: "Bearer " + token },
    };
    const user = await axios(options); // send request
    if (user.data && user.data.user_metadata && user.data.user_metadata.theme) {
      res.status(200).send({
        code: 200,
        message: "user metadata found",
        theme: user.data.user_metadata.theme,
      });
    } else {
      functions.logger.error(`Request to get metadata failed with response: ${user.status}`);
      res.status(404).send({
        code: 404,
        message: "unable to retrieve requested resource",
      });
    }
  } catch (err) {
    res.status(500).send({ status: 500 });
  }
});

const service = functions.https.onRequest(app);

module.exports = { app, service };
