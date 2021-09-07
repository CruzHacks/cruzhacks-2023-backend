const functions = require("firebase-functions");
const { db } = require("../../utils/admin");
const helmet = require("helmet");
const express = require("express");
const cors = require("cors");
const { corsConfig } = require("../../utils/config");
const { hasPermission } = require("../../utils/middleware");
const { addDocument, queryDocument } = require("../../utils/database");

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
  // orderBy() should default to ascending, double check
  const snapshot = await db.collection("announcements").orderBy("timeStamp").get();
  if (snapshot.empty) {
    return res.status(200).send(JSON.stringify([]));
  }
  const documents = [];
  snapshot.forEach((doc) => {
    const id = doc.id;
    const data = doc.data();
    documents.push({ id, ...data });
  });
  return res.status(200).send(JSON.stringify(documents));
});

// Delete
announcements.delete("/:id", hasPermission("Organizer"), async (req, res) => {
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
announcements.post("/", hasPermission("Organizer"), (req, res) => {
  const { title, message, timeStamp } = req.body;
  const data = { title, message, timeStamp };
  addDocument("announcements", title, data)
    .then((doc) => {
      return res.status(200).send({ error: false, status: 200, message: "Item successfully added.", data: doc });
    })
    .catch((err) => res.status(500).send({ error: true, status: 500, message: err.message }));
});

module.exports = { announcements };
