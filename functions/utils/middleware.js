var jwt = require("express-jwt");
var jwks = require("jwks-rsa");
const { auth0Config, jwk_uri } = require("./config");

const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: jwk_uri,
  }),
  audience: auth0Config.audience,
  issuer: auth0Config.issuer,
  algorithms: ["RS256"],
});

module.exports = { jwtCheck };
