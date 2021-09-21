const { db } = require("./admin");

const addDocument = (collection, document) => {
  return db.collection(collection).add(document);
};

const queryDocument = (collection, id) => {
  return db.collection(collection).doc(id).get();
};

const setDocument = (collection, id, document) => {
  return db.collection(collection).doc(id).set(document);
};

const queryCollection = (collection) => {
  return db.collection(collection).get();
};

const queryCollectionSorted = (collection, opt) => {
  // returns sorted in ascending order
  // opt must be a string and it must be a doc field
  return db.collection(collection).orderBy(opt).get();
};

const deleteDocument = (collection, id) => {
  return db.collection(collection).doc(id).delete();
};

module.exports = { addDocument, queryDocument, setDocument, queryCollection, queryCollectionSorted, deleteDocument };
