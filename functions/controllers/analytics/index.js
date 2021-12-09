const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

const { jwtCheck, hasReadAnalytics } = require("../../utils/middleware");
const { queryDocument } = require("../../utils/database");

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

application.get("/", jwtCheck, hasReadAnalytics, async (req, res) => {
  try {
    const analyticsSnapshot = await queryDocument("analytics", "applicant-analytics");
    if (!analyticsSnapshot.exists) {
      throw new Error("No Document");
    }

    return res.status(201).send({
      status: 201,
      message: {
        applicantCount: analyticsSnapshot.get("applicantCount"),
        firstTime: analyticsSnapshot.get("firstTimeCount"),
        ucscApplicants: analyticsSnapshot.get("ucscStudentCount"),
      },
    });
  } catch (error) {
    if (error.message === "No Document") {
      return res.status(200).send({ status: 200, message: "No Document" });
    }
    return res.status(500).send({ status: 500, message: "Insufficient Permissions" });
  }
});

const service = functions.https.onRequest(application);

module.exports = { application, service };
