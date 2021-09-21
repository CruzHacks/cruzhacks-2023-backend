/* eslint-disable consistent-return */
var jwt = require("express-jwt");
var jwks = require("jwks-rsa");
const { audience, issuer, jwk_uri, apikey } = require("./config");

/*
Validates jwt and parses data into req.user
*/
const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
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

const hasUpdateAnnouncement = hasPermission("update:announcements");
const hasDeleteAnnouncement = hasPermission("delete:announcements");

module.exports = { jwtCheck, validKey, hasPermission, hasUpdateAnnouncement, hasDeleteAnnouncement };
