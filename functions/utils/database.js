const { db } = require("./admin");

const addDocument = (collection, document) => {
  db.collection(collection).add(document);
};

const queryDocument = (collection, id) => {
  return db.collection(collection).doc(id).get();
};

module.exports = { addDocument, queryDocument };
