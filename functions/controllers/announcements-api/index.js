const functions = require("firebase-functions");
const helmet = require("helmet");
const express = require("express");
const cors = require("cors");
const { corsConfig } = require("../../utils/config");
const { jwtCheck, validKey, hasDeleteAnnouncement, hasUpdateAnnouncement } = require("../../utils/middleware");
const { addDocument, queryCollectionSorted, deleteDocument } = require("../../utils/database");

const announcements = express();
const corsOptions = {
  origin: corsConfig,
  optionsSuccessStatus: 200,
};

announcements.disable("x-powered-by");
announcements.use(helmet());
announcements.use(cors(corsOptions));
announcements.use(express.json());

announcements.get("/", validKey, async (req, res) => {
  try {
    const snapshot = await queryCollectionSorted("announcements", "timeStamp");
    const documents = [];
    snapshot.forEach((doc) => {
      const id = doc.id;
      const data = doc.data();
      documents.push({ id: id, title: data.title, message: data.message, timeStamp: data.timeStamp });
    });
    return res.status(200).send({
      error: false,
      status: 200,
      message: "Request success, announcements retrieved",
      announcements: JSON.stringify(documents),
      count: documents.length,
    });
  } catch (error) {
    return res.status(500).send({
      error: true,
      status: 500,
      message: "Internal Server Error",
    });
  }
});

announcements.delete("/:id", jwtCheck, hasDeleteAnnouncement, async (req, res) => {
  deleteDocument("announcements", req.params.id)
    .then(() =>
      res.status(200).send({
        error: false,
        status: 200,
        message: "Announcement successfully removed!",
      }),
    )
    .catch((error) => {
      functions.logger.log(error.message);
      return res.status(500).send({
        error: true,
        status: 500,
        message: "Internal Server Error",
      });
    });
});

announcements.post("/", jwtCheck, hasUpdateAnnouncement, async (req, res) => {
  const { title, message } = req.body;
  if (!title || title.length > 50 || !/^[a-zA-Z0-9 ]+$/.test(title)) {
    return res.status(400).send({ error: true, status: 400, message: "Invalid title" });
  }
  if (!message || message.length > 200 || !/^[a-zA-Z0-9 ]+$/.test(message)) {
    return res.status(400).send({ error: true, status: 400, message: "Invalid Message" });
  }
  const data = { title: title, message: message, date: Date.now() };

  return addDocument("announcements", data)
    .then((doc) => {
      if (!doc) {
        functions.logger.log("Missing Response");
      }
      return res.status(201).send({ error: false, status: 201, message: "Item successfully added." });
    })
    .catch((err) => {
      functions.logger.log(err.message);
      return res.status(500).send({ error: true, status: 500, message: "Internal Server Error" });
    });
});

module.exports = { announcements };
