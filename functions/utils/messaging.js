const { admin } = require("./database");

const messaging = admin.messaging();

const subscribeUserToTopic = (tokens, topic) => messaging.subscribeToTopic(tokens, topic);

const sendMessage = (payload) => messaging.send(payload);

module.exports = {
  messaging,
  subscribeUserToTopic,
  sendMessage,
};
