const functions = require("firebase-functions");

const helloWorld = (request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  response.send({
    message: "Hello from Firebase!",
  });
};

module.exports = { helloWorld };
