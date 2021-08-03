const functions = require("firebase-functions");
const express = require("express");
const app = express();
const { auth } = require("express-openid-connect");
const { config, checkAuthenticated } = require("./controllers/Auth0/token-create.ts");

app.listen(3000);
app.use(auth(config));
app.get("/", checkAuthenticated);

exports.checkAuthenticated = functions.https.onRequest(checkAuthenticated);
