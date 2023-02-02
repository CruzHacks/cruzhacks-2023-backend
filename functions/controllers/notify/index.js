const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const { jwtCheck, hasUpdateAnnouncement } = require("../../utils/middleware");
const { writeAnnouncement } = require("../../utils/database");

const notify = express();
notify.disable("x-powered-by");
notify.use(express.json());

const auth0Config = functions.config().auth;
const corsConfig = auth0Config ? auth0Config.cors : "";

const corsOptions = {
  origin: corsConfig,
  optionsSuccessStatus: 200,
};

notify.use(cors(corsOptions));

notify.post("/send", jwtCheck, hasUpdateAnnouncement, async (req, res) => {
  try {
    const topic = req.body.topic;
    const message = req.body.body;
    const title = req.body.title || "";

    if (!topic && !message) res.status(400).send({ message: "Invalid Request Body", status: 400 });

    let notification = {
      title: title,
      body: message,
    };

    writeAnnouncement(topic, { ...notification, date: Date.now() });
    res.status(201).send({ message: "Announcement Successfully Saved", status: 200 });
  } catch (error) {
    functions.logger.error("Error occured:", error);
    res.status(500).send({ message: "Error in processing request", status: 500 });
  }
});

const service = functions.https.onRequest(notify);

module.exports = { notify, service };
