const functions = require("firebase-functions");
const { admin, db } = require("./database");

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

const service = functions.firestore.document("applicants/{docId}").onCreate(async (snap) => {
  const document = snap.data();
  const analyticsDoc = db.collection("analytics").doc("applicant-analytics");
  const toUpdate = {
    ucscIncrement: document.ucscStudent ? 1 : 0,
    firstTimeIncrement: document.firstCruzHack ? 1 : 0,
    applicantIncrement: 1,
  };
  try {
    await analyticsDoc.update({
      applicantCount: admin.firestore.FieldValue.increment(toUpdate.applicantIncrement),
      firstTimeCount: admin.firestore.FieldValue.increment(toUpdate.firstTimeIncrement),
      ucscStudentCount: admin.firestore.FieldValue.increment(toUpdate.ucscIncrement),
    });
  } catch (error) {
    functions.logger.error(error.message);
    await analyticsDoc.set({
      applicantCount: toUpdate.applicantIncrement,
      firstTimeCount: toUpdate.firstTimeIncrement,
      ucscStudentCount: toUpdate.ucscIncrement,
    });
  }
});

module.exports = { service };
