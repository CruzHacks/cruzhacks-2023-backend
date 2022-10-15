const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const { jwtCheck, hasReadAdmin } = require("../../utils/middleware");
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

applicant.get("/applicant/:id", jwtCheck, hasReadAdmin, async (req, res) => {
  try {
    const snapshot = await queryDocument("applicants", req.params.id);
    const document = {
      id: snapshot.get("id"),
      name: snapshot.get("name"),
      age: snapshot.get("age"),
      major: snapshot.get("major"),
      status: snapshot.get("status"),
    };
    if (!snapshot.exists) {
      throw new Error("Applicant doesn't exist for the given ID");
    }
    return res.status(200).send({
      error: false,
      status: 200,
      message: "Request success, applicant received",
      applicant: JSON.stringify(document),
    });
  } catch (error) {
    if (error.message === "Applicant doesn't exist for the given ID") {
      return res.status(404).send({ status: 404, message: "Applicant doesn't exist for the given ID" });
    }
    return res.status(500).send({ status: 500, message: "Server Error" });
  }
});

const service = functions.https.onRequest(applicant);

module.exports = { applicant, service };
