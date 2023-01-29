const admin = require("firebase-admin");
const { firebaseConfig } = require("firebase-functions");
const functions = require("firebase-functions");

admin.initializeApp();
db = admin.firestore();
storage = admin.storage();
rtdb = admin.database();

const addDocument = (collection, document) => {
  return db.collection(collection).add(document);
};

const queryDocument = (collection, id) => {
  return db.collection(collection).doc(id).get();
};

const setDocument = (collection, id, fields) => {
  return db.collection(collection).doc(id).set(fields);
};

const updateDocument = (collection, id, fields) => {
  return db.collection(collection).doc(id).update(fields);
};

const queryCollection = (collection) => {
  return db.collection(collection).get();
};

const queryCollectionSorted = (collection, opt, limit) => {
  // returns sorted in ascending order
  // opt must be a string and it must be a doc field
  return db.collection(collection).orderBy(opt, "desc").limit(limit).get();
};

const deleteDocument = (collection, id) => {
  return db.collection(collection).doc(id).delete();
};

const uploadFile = (bucketName, filename, file) => {
  const bucket = storage.bucket(bucketName);
  return bucket.upload(file.path, {
    destination: filename,
  });
};

const docTransaction = async (collection, id, updateFunction) => {
  await db.runTransaction(async (t) => {
    const docRef = db.collection(collection).doc(id);
    await updateFunction(t, docRef);
  });
};

const dbTransaction = async (updateFunction) => {
  await db.runTransaction(updateFunction);
};

const documentRef = (collection, id) => {
  return db.collection(collection).doc(id);
};

/*----------------------------------------*/
/*         Real-Time Database ops         */
/*----------------------------------------*/

const writeAnnouncement = (collection, fields) => {
  return rtdb.ref(collection).push().set(fields);
};

module.exports = {
  addDocument,
  queryDocument,
  setDocument,
  updateDocument,
  queryCollection,
  queryCollectionSorted,
  deleteDocument,
  uploadFile,
  docTransaction,
  dbTransaction,
  documentRef,
  writeAnnouncement,
  admin,
  db,
  rtdb,
  storage,
};
