const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

const { jwtCheck, hasReadAnalytics } = require("../../utils/middleware");
const { queryDocument } = require("../../utils/database");

const auth0Config = functions.config().auth;
const corsConfig = auth0Config ? auth0Config.cors : "";
const analytics = express();

const corsOptions = {
  origin: corsConfig,
  optionsSuccessStatus: 200,
};

analytics.disable("x-powered-by");
analytics.use(cors(corsOptions));
analytics.use(express.json());

analytics.get("/", jwtCheck, hasReadAnalytics, async (req, res) => {
  try {
    const analyticsSnapshot = await queryDocument("analytics", "applicant-analytics");
    if (!analyticsSnapshot.exists) {
      throw "No Doc";
    }
    res.status(201).send({
      message: {
        ucscApplicants: analyticsSnapshot.get("ucscStudentCount"),
        firstTime: analyticsSnapshot.get("firstTimeStudentCount"),
        applicantCount: analyticsSnapshot.get("applicantCount"),
      },
    });
  } catch (err) {
    if (err === "No Doc") {
      res.status(404).send({ status: 404, message: "No Document" });
    }
    res.status(500).send({ status: 500, message: "Insufficient Permissions" });
  }
});

const service = functions.https.onRequest(analytics);

module.exports = { analytics, service };
