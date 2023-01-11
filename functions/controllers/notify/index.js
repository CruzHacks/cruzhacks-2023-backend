const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const { jwtCheck, hasUpdateAnnouncement } = require("../../utils/middleware");
const { subscribeUserToTopic, sendMessage } = require("../../utils/messaging");
const { setRefRTDB } = require("../../utils/database");
const { nanoid } = require("nanoid");

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

notify.put("/register", jwtCheck, async (req, res) => {
  try {
    const registrationToken = req.body.registrationToken;
    const topic = req.body.topic;
    if (!registrationToken && !topic) res.status(400).send({ message: "Invalid Request Body", status: 400 });
    await subscribeUserToTopic([registrationToken], topic)
      .then((response) => {
        functions.logger.log("Successfully subscribed user to topic");
        res.status(201).send({ message: response, status: 201 });
      })
      .catch((error) => {
        functions.logger.error("Error subscribing user to topic", error);
        res.status(500).send({ message: "Unable to register to topic", status: 500 });
      });
  } catch (error) {
    functions.logger.error("Error occured: ", error);
    res.status(500).send({ message: "Unable to register to topic", status: 500 });
  }
});

notify.post("/send", jwtCheck, hasUpdateAnnouncement, async (req, res) => {
  try {
    const topic = req.body.topic;
    const message = req.body.body;
    const title = req.body.title || "";

    if (!topic && !message) res.status(400).send({ message: "Invalid Request Body", status: 400 });
    const payload = {
      notification: {
        title: title,
        body: message,
      },
      data: {
        title: title,
        body: message,
      },
    };
    if (typeof topic === "string") {
      payload.topic = topic;
    } else {
      if (topic.length === undefined) res.status(400).send({ message: "Invalid Request Body", status: 400 });

      payload.condition = topic.join(" in topics || ") + "in topics";
    }

    await sendMessage(payload)
    .then((response) => {
      functions.logger.log("Successfully sent message:", response);
      res.status(201).send({ message: "Success", status: 201 });
    })
    .then(async() => await setRefRTDB("Announcements", nanoid(), { ...payload.notification, date: Date.now() }))
    .catch((error) => {
      functions.logger.error("Error sending message:", error);
      res.status(500).send({ message: "Error in processing request", status: 500 });
    });
  } catch (error) {
    functions.logger.error("Error occured:", error);
    res.status(500).send({ message: "Error in processing request", status: 500 });
  }
});

const service = functions.https.onRequest(notify);

module.exports = { notify, service };
