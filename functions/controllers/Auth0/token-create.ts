const dotenv = require("dotenv");
dotenv.config();

const config = {
    authRequired: false,
    auth0Logout: true,
    baseURL: process.env.BASE_URL,
    clientID: process.env.CLIENT_ID,
    issuerBaseURL: process.env.ISSUER_BASE_URL,
    secret: process.env.SECRET,
};

const checkAuthenticated = (req, res) => {
    res.send(req.oidc.isAuthenticated() ? "Logged In" : "Logged Out");
};

module.exports = { config, checkAuthenticated };
