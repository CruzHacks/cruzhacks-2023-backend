const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

const { jwtCheck, hasReadApp } = require("../../utils/middleware");
const { queryDocument } = require("../../utils/database");
const admin = require("firebase-admin");
admin.initializeApp();
firedb = admin.firestore();

const application = express();
application.disable("x-powered-by");
application.use(express.json());

const auth0Config = functions.config().auth;
const corsConfig = auth0Config ? auth0Config.cors : "";

const corsOptions = {
  origin: corsConfig,
  optionsSuccessStatus: 200,
};

application.use(cors(corsOptions));

application.get("/checkApp", jwtCheck, hasReadApp, async (req, res) => {
  try {
    const doc = await queryDocument("applicants", req.user.sub);
    const appStatus = doc.get("status");
    if (appStatus === undefined) {
      throw new Error("No Document");
    }
    res.status(200).send({ code: 200, status: appStatus, exists: true, message: "Document Found" });
  } catch (error) {
    if (error.message === "No Document") {
      res.status(200).send({ code: 200, status: "No Document", exists: false, message: "No Document" });
    } else {
      res.status(500).send({ code: 500, status: "No Document", exists: false, message: "Internal Server Error" });
    }
  }
});

const service = functions.https.onRequest(application);

module.exports = { application, service };
