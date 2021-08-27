const functions = require("firebase-functions");
const { db } = require("./admin");
const helmet = require("helmet");
const express = require("express");
const cors = require("cors");
const { hasPermission } = require("../../utils/middleware");
const { addDocument, queryDocument, deleteDocument } = require("../../utils/database");

const announcements = express();
const corsOptions = {
  origin: corsConfig,
  optionsSuccessStatus: 200,
};

announcements.disable("x-powered-by");
announcements.use(helmet());
announcements.use(cors(corsOptions));
announcements.use(express.json());

// announcements.post('/')

announcements.get('/announcements', async (req, res) => {
  // orderBy() should default to ascending, double check
  const snapshot = await db.collection("announcements").orderBy("timeStamp").get();
  if (snapshot.empty) {
    return res.status(200).send(JSON.stringify([]));
  }
  const documents = [];
  snapshot.forEach(doc => {
    const id = doc.id;
    const data = doc.data();
    documents.push({id, ...data});
  });
  return res.status(200).send(JSON.stringify(documents));
});

announcements.delete("/announcements/:id", hasPermission, async (req, res) => {
  if (deleteDocument("announcements", req.params.id)) {
    return res.status(200).send({ error: false, status: 200, message: "successfully removed from database" });
  }
  return res.status(400).send({ error: true, status: 400, message: "unable to remove from database" });
});

module.exports = { announcements };
