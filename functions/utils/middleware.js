/* eslint-disable consistent-return */
const config = require("firebase-functions").config();
var jwt = require("express-jwt");
var { expressJwtSecret } = require("jwks-rsa");

const app = config.app;
const auth0Config = config.auth;
const apikey = app ? app.apikey : "";
const audience = auth0Config ? auth0Config.audience : "";
const issuer = auth0Config ? auth0Config.issuer : "";
const jwk_uri = auth0Config ? auth0Config.jwk_uri + ".well-known/jwks.json" : ".well-known/jwks.json";

/*
Validates jwt and parses data into req.user
*/

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

/*
Additional Middleware for Non-Authenticated Requests
Authentication field must be included with correct key
You cannot use this Middleware with this jwtCheck
*/

const validKey = (req, res, next) => {
  if (!req.headers.authentication || req.headers.authentication !== apikey || apikey === "") {
    return res.status(403).send({ message: "Invalid Api Key" });
  }
  next();
};

/*
Middleware that checks if custom API specified Auth0 permissions exist on a jwt
Note: 
These permissions are assigned by the Auth0 roles
They are not for utilizing Auth0 Management Endpoints
*/
const hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions || !req.user.permissions.includes(permission)) {
      return res.status(403).send({ message: "Invalid Permissions" });
    }
    next();
  };
};

const hasUpdateApp = hasPermission("update:app");
const hasUpdateAppStatus = hasPermission("update:applicationstatus");
const hasReadApp = hasPermission("read:app");
const hasUpdateAnnouncement = hasPermission("update:announcements");
const hasDeleteAnnouncement = hasPermission("delete:announcements");
const hasReadAdmin = hasPermission("read:admin");
const hasUpdateStatus = hasPermission("update:applicationstatus");
const hasCreateHacker = hasPermission("create:hacker");
const hasUpdateHacker = hasPermission("update:hacker");

module.exports = {
  jwtCheck,
  validKey,
  hasPermission,
  hasUpdateApp,
  hasUpdateAppStatus,
  hasReadApp,
  hasUpdateAnnouncement,
  hasDeleteAnnouncement,
  hasReadAdmin,
  hasUpdateStatus,
  hasCreateHacker,
  hasUpdateHacker,
};
