const admin = require("firebase-admin");
var serviceAccount = require("../../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cruzhacks-2024-developme-d58c3-default-rtdb.firebaseio.com",
});

const db = admin.firestore();
const storage = admin.storage();
const rtdb = admin.database();

const addDocument = (collection, document) => {
  return db.collection(collection).add(document);
};

const queryDocument = (collection, id) => {
  return db.collection(collection).doc(id).get();
};

const setDocument = (collection, id, fields, merge = false) => {
  return db.collection(collection).doc(id).set(fields, { merge: merge });
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

const writeAnnouncement = (collection, fields) => {
  return rtdb.ref(collection).push().set(fields);
};

const collectionRef = (collection) => {
  return db.collection(collection);
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
  collectionRef,
  admin,
  db,
  rtdb,
  storage,
};
