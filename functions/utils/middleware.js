var jwt = require("express-jwt");
var jwks = require("jwks-rsa");
const { audience, issuer, jwk_uri } = require("./config");

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

module.exports = { jwtCheck };
