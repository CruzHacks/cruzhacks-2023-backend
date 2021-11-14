const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const { hasDeleteAnnouncement, hasUpdateAnnouncement } = require("../../utils/middleware");
const { addDocument, queryCollectionSorted, deleteDocument } = require("../../utils/database");
const { alphanumericRegex, alphanumericPunctuationRegexWithNewLine } = require("../../utils/regex");

const auth0Config = functions.config().auth;
const app = functions.config().app;
const corsConfig = auth0Config ? auth0Config.cors : "";

const apikey = app ? app.apikey : "";
const audience = auth0Config ? auth0Config.audience : "";
const issuer = auth0Config ? auth0Config.issuer : "";
const jwk_uri = auth0Config ? auth0Config.jwk_uri + ".well-known/jwks.json" : ".well-known/jwks.json";

var jwt = require("express-jwt");
var { expressJwtSecret } = require("jwks-rsa");

const jwtCheck = jwt({
  secret: expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: jwk_uri,
  }),
  audience: audience,
  issuer: issuer,
  algorithms: ["RS256"],
});

const validKey = (req, res, next) => {
  if (!req.headers.authentication || req.headers.authentication !== apikey || apikey === "") {
    return res.status(403).send({ message: "Invalid Api Key" });
  }
  next();
};

const announcements = express();
const corsOptions = {
  origin: corsConfig,
  optionsSuccessStatus: 200,
};

announcements.disable("x-powered-by");
announcements.use(cors(corsOptions));
announcements.use(express.json());

announcements.get("/", validKey, async (req, res) => {
  try {
    const snapshot = await queryCollectionSorted("announcements", "date", 4);
    const documents = [];
    snapshot.forEach((doc) => {
      const id = doc.id;
      const data = doc.data();
      documents.push({ id: id, title: data.title, message: data.message, date: data.date });
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
  if (!title || title.length > 25 || alphanumericRegex(title)) {
    return res.status(400).send({ error: true, status: 400, message: "Invalid title" });
  }
  if (!message || message.length > 100 || alphanumericPunctuationRegexWithNewLine(message)) {
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

const service = functions.https.onRequest(announcements);

module.exports = { announcements, service, jwtCheck, validKey };
