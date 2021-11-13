const addDocument = (db, collection, document) => {
  return db.collection(collection).add(document);
};

const queryDocument = (db, collection, id) => {
  return db.collection(collection).doc(id).get();
};

const setDocument = (db, collection, id, fields) => {
  return db.collection(collection).doc(id).set(fields);
};

const queryCollection = (db, collection) => {
  return db.collection(collection).get();
};

const queryCollectionSorted = (db, collection, opt, limit) => {
  // returns sorted in ascending order
  // opt must be a string and it must be a doc field
  return db.collection(collection).orderBy(opt, "desc").limit(limit).get();
};

const deleteDocument = (db, collection, id) => {
  return db.collection(collection).doc(id).delete();
};

module.exports = {
  addDocument,
  queryDocument,
  setDocument,
  queryCollection,
  queryCollectionSorted,
  deleteDocument,
};
