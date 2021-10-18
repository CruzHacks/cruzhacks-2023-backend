const testConfig = require("firebase-functions-test")();
const request = require("supertest");
const { analytics } = require("../../controllers/analytics/index");

const { queryDocument } = require("../../utils/database");
const { jwtCheck, hasReadAnalytics } = require("../../utils/middleware");
const { makeDocumentSnapshot } = require("firebase-functions-test/lib/providers/firestore");

testConfig.mockConfig({
  auth: {
    cors: "site",
    audience: "audience",
    issuer: "issuer",
    jwk_uri: "some uri",
  },
});

jest.mock("../../utils/middleware");
jest.mock("../../utils/database");

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

    const res = await request(analytics).get("/");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasReadAnalytics).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(201);
    done();
  });
});
