const { queryDocument } = require("../../../utils/database");
const { jwtCheck, hasReadAnalytics } = require("../../../utils/middleware");
const { makeDocumentSnapshot } = require("firebase-functions-test/lib/providers/firestore");
const { application } = require("../../../functions/controllers/application/index");

jwtCheck.mockImplementation((req, res, next) => {
  next();
});

hasReadAnalytics.mockImplementation((req, res, next) => {
  next();
});

describe("Analytics test", () => {
  it("Should return analytics", async (done) => {
    fakeDoc = makeDocumentSnapshot({
      applicantCount: 100,
      firstTimeCount: 100,
      ucscStudentCount: 100,
    });
    queryDocument.mockImplementationOnce(() => Promise.resolve(fakeDoc));

    const res = await request(application).get("/analytics");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasReadAnalytics).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(201);
    done();
  });
  it("Should return no document", async (done) => {
    const res = await request(application).get("/analytics");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasReadAnalytics).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(404);
    expect(res.body).toBe({ status: 404, message: "No Document" });
    done();
  });
  it("Should return invalid permissions", async (done) => {
    fakeDoc = makeDocumentSnapshot({
      applicantCount: 100,
      firstTimeCount: 100,
      ucscStudentCount: 100,
    });
    queryDocument.mockImplementationOnce(() => Promise.resolve(fakeDoc));
    
    const res = await request(application).get("/analytics");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasReadAnalytics).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(404);
    expect(res.body).toBe({ status: 404, message: "No Document" });
    done();
  });
});
