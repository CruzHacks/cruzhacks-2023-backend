const functions = require("firebase-functions");
const { db, admin } = require("./admin")

/*
    writeToAnalytics adds an event trigger to 'applicants' collection.
    The event trigger updates a separate document's fields in the 'analytics' collection.
    Fields include: 
                -> total number of applicants
                -> number of UCSC student applicants
                -> number of first time hackers
    **NOTE**
    Fields are not mutually exclusive!
    i.e. in the event of a document creation;
            -> if an applicant were a first time hacker and a UCSC student:
                --> ALL THREE FIELDS WILL BE INCREMENTED BY ONE
                    
*/

const handleOnWrite = (change, context) => {
  const oldDocument = change.before.exists ? change.before.data() : null;
  const document = change.after.exists ? change.after.data() : null;
  const analyticsDoc = db.collection("analytics").doc("applicant-analytics");
  if (document && !oldDocument) {
    // onCreate case
    const toUpdate = {
      ucscIncrement: document.UCSC_Student ? 1 : 0,
      firstTimeIncrement: document.First_CruzHack ? 1 : 0,
      applicantIncrement: 1,
    };
    const snapShot = analyticsDoc.get();
    if (!snapShot.exists) {
      return analyticsDoc.set({
        applicant_count: toUpdate.applicantIncrement,
        firstTime_count: toUpdate.firstTimeIncrement,
        ucscStudent_count: toUpdate.ucscIncrement,
      });
    }
    return analyticsDoc.update({
      applicant_count: admin.firestore.FieldValue.increment(toUpdate.applicantIncrement),
      firstTime_count: admin.firestore.FieldValue.increment(toUpdate.firstTimeIncrement),
      ucscStudent_count: admin.firestore.FieldValue.increment(toUpdate.ucscIncrement),
    });
  } else if (document && oldDocument) {
    // onUpdate case
    if (document === oldDocument) {
      return functions.logger.info(
        "writeToAnalytics called onUpdate but no significant diffs between field values. No changes were made to analytics document.",
        { docId: context.params.docId },
      );
    }
    const toUpdate = {
      ucscIncrement: oldDocument.UCSC_Student ? (document.UCSC_Student ? 0 : -1) : document.UCSC_Student ? 1 : 0,
      firstTimeIncrement: oldDocument.First_CruzHack
        ? document.First_CruzHack
          ? 0
          : -1
        : document.First_CruzHack
        ? 1
        : 0,
      applicantIncrement: 0,
    };
    return analyticsDoc.update({
      applicant_count: admin.firestore.FieldValue.increment(toUpdate.applicantIncrement),
      firstTime_count: admin.firestore.FieldValue.increment(toUpdate.firstTimeIncrement),
      ucscStudent_count: admin.firestore.FieldValue.increment(toUpdate.ucscIncrement),
    });
  } else if (!document && oldDocument) {
    // onDelete case
    const toUpdate = {
      ucscIncrement: oldDocument.UCSC_Student ? -1 : 0,
      firstTimeIncrement: oldDocument.First_CruzHack ? -1 : 0,
      applicantIncrement: -1,
    };
    return analyticsDoc.update({
      applicant_count: admin.firestore.FieldValue.increment(toUpdate.applicantIncrement),
      firstTime_count: admin.firestore.FieldValue.increment(toUpdate.firstTimeIncrement),
      ucscStudent_count: admin.firestore.FieldValue.increment(toUpdate.ucscIncrement),
    });
  } else {
    // if both are null ( definitely shouldn't happen. Could possibly happen upon a delete to a non-existent document: needs to be validated though )
    return functions.logger.error("writeToAnalytics called but unable to access changes to document!", {
      docId: context.params.docId,
    });
  }
};

const service = functions.firestore.document("applicants/{docId}").onWrite((change, context) => handleOnWrite(change, context));
module.exports = { service };
