const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const { jwtCheck, hasPermission } = require("../../utils/middleware");
const { queryDocument } = require("../../utils/database");

const applicant = express();
applicant.disable("x-powered-by");
applicant.use(express.json());

const auth0Config = functions.config().auth;
const corsConfig = auth0Config ? auth0Config.cors : "";

const corsOptions = {
  origin: corsConfig,
  optionsSuccessStatus: 200,
};

applicant.use(cors(corsOptions));

applicant.get("/applicant/:id/", jwtCheck, hasPermission, async (req, res) => {
  try {
    const snapshot = await queryDocument("applicants", req.params.id);
    if (!snapshot.exists) {
      throw new Error("Applicant doesn't exist for the given ID");
    }
    return res.status(200).send({
      error: false,
      status: 200,
      message: snapshot.data(),
    });
  } catch (error) {
    if (error.message === "Applicant doesn't exist for the given ID") {
      return res.status(200).send({ status: 200, message: "Applicant doesn't exist for the given ID" });
    }
    return res.status(500).send({ status: 500, message: "Insufficient Permissions" });
  }
});

const service = functions.https.onRequest(applicant);

module.exports = { applicant, service };
