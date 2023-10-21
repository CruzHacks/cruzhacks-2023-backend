import * as admin from "firebase-admin";
import { Transaction } from "firebase-admin/firestore";

var serviceAccount = require("../../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cruzhacks-2024-developme-d58c3-default-rtdb.firebaseio.com",
});

const db = admin.firestore();
const storage = admin.storage();
const rtdb = admin.database();

const addDocument = (collection: string, document: any) => {
  return db.collection(collection).add(document);
};

const queryDocument = (collection: string, id: string) => {
  return db.collection(collection).doc(id).get();
};

const setDocument = (collection: string, id: string, fields: Object, merge = false) => {
  return db.collection(collection).doc(id).set(fields, { merge: merge });
};

const updateDocument = (collection: string, id: string, fields: object) => {
  return db.collection(collection).doc(id).update(fields);
};

const queryCollection = (collection: string) => {
  return db.collection(collection).get();
};

const queryCollectionSorted = (collection: string, opt: string, limit: number) => {
  // returns sorted in ascending order
  // opt must be a string and it must be a doc field
  return db.collection(collection).orderBy(opt, "desc").limit(limit).get();
};

const deleteDocument = (collection: string, id: string) => {
  return db.collection(collection).doc(id).delete();
};

const uploadFile = (bucketName: string, filename: string, file: any) => {
  const bucket = storage.bucket(bucketName);
  return bucket.upload(file.path, {
    destination: filename,
  });
};

const docTransaction = async (collection: string, id: string, updateFunction: Function) => {
  await db.runTransaction(async (t) => {
    const docRef = db.collection(collection).doc(id);
    await updateFunction(t, docRef);
  });
};

const dbTransaction = async (updateFunction: (transaction: Transaction) => Promise<unknown>) => {
  await db.runTransaction(updateFunction);
};

const documentRef = (collection: string, id: string) => {
  return db.collection(collection).doc(id);
};

const writeAnnouncement = (collection: string, fields: object) => {
  return rtdb.ref(collection).push().set(fields);
};

const collectionRef = (collection: string) => {
  return db.collection(collection);
};

export {
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
