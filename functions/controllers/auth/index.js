const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const axios = require("axios");

const { jwtCheck } = require("../../utils/middleware");
const { corsConfig, issuer } = require("../../utils/config");
const { getM2MToken } = require("../../utils/m2m");

const app = express();
app.disable("x-powered-by");
app.use(helmet());
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
    const token = await getM2MToken();
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
      res.status(406).send({ code: 406, message: "Email Already Verified" });
    } else {
      res.status(500).send({ code: 500, message: "Unable to Send Verification Email", err: err });
    }
  }
});

module.exports = { app };
