const functions = require("firebase-functions");
const { db } = require("../../utils/admin");
const helmet = require("helmet");
const express = require("express");
const cors = require("cors");
const { corsConfig } = require("../../utils/config");
const { hasPermission } = require("../../utils/middleware");
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

// Read all
announcements.get("/", async (req, res) => {
  const snapshot = await queryCollectionSorted("announcements", "timeStamp");
  const documents = [];
  snapshot.forEach((doc) => {
    const id = doc.id;
    const data = doc.data();
    documents.push({ id, ...data });
  });
  return res.status(200).send({
    error: false,
    status: 200,
    message: "Request success, announcements retrieved",
    announcements: JSON.stringify(documents),
  });
});

announcements.delete("/:id", hasPermission("delete:announcements"), async (req, res) => {
  const docRef = db.collection("announcements").document(req.params.id);
  await docRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        doc.delete();
        return res.status(200).send({ error: false, status: 200, message: "Item successfully removed." });
      }
      return res.status(400).send({
        error: true,
        status: 400,
        message: "The item requested for removal does not exist, please verify the query id.",
      });
    })
    .catch((err) => res.status(500).send({ error: true, status: 500, message: err.message }));
});

// Create
announcements.post("/", hasPermission("update:announcements"), async (req, res) => {
  const { title, message, timeStamp } = req.body;
  // check if title matches regex  /^[a-zA-Z0-9 ]
  if (!/^[a-zA-Z0-9 ]+$/.test(title) || !/^[a-zA-Z0-9 ]+$/.test(message) || !timeStamp) {
    return res.status(400).send({ error: true, status: 500, message: "Invalid data provided." });
  }
  const data = { title, message, timeStamp };
  // ***remember that we need to validate our data
  addDocument("announcements", data)
    .then((doc) => {
      return res.status(201).send({ error: false, status: 201, message: "Item successfully added.", data: doc });
    })
    .catch((err) => res.status(500).send({ error: true, status: 500, message: err.message }));
});

module.exports = { announcements };
