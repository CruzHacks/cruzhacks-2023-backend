const { db } = require("./admin");

const addDocument = (collection, id, document) => {
  return db.collection(collection).doc(id).set(document);
};

const queryDocument = (collection, id) => {
  return db.collection(collection).doc(id).get();
};

module.exports = { addDocument, queryDocument };
