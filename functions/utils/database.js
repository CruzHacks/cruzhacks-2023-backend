const { db } = require("./admin");

const addDocument = (collection, document) => {
  db.collection(collection).add(document);
};

const queryDocument = (collection, id) => {
  return db.collection(collection).doc(id).get();
};

const setDocument = (collection, id, document) => {
  return db.collection(collection).doc(id).set(document);
};

module.exports = { addDocument, queryDocument, setDocument };
