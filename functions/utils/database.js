const { db } = require("./admin");

const addDocument = (collection, document) => {
  db.collection(collection).add(document);
};

const queryDocument = (collection, id) => {
  return db.collection(collection).doc(id).get();
};

const deleteDocument = (collection, id) => {
  const snapshot = queryDocument(collection, id);
  if (snapshot.exists) {
    snapshot.delete();
    return true;
  }
  return false;
};

module.exports = { addDocument, queryDocument, deleteDocument };
