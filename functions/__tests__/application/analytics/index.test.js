const testConfig = require("firebase-functions-test")();

const request = require("supertest");
const { queryDocument } = require("../../../utils/database");
const { jwtCheck, hasReadAdmin } = require("../../../utils/middleware");
const { makeDocumentSnapshot } = require("firebase-functions-test/lib/providers/firestore");
const { application } = require("../../../controllers/analytics/index");

testConfig.mockConfig({
  auth: {
    cors: "site",
    audience: "audience",
    issuer: "issuer",
    jwk_uri: "some uri",
  },
});

jest.mock("../../../utils/middleware");
jest.mock("../../../utils/database");

describe("Analytics test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jwtCheck.mockImplementation((req, res, next) => {
      next();
    });

    hasReadAdmin.mockImplementation((req, res, next) => {
      next();
    });
  });

  it("Should return analytics", async (done) => {
    const fakeDoc = makeDocumentSnapshot({
      applicantCount: 100,
      firstTimeCount: 100,
      ucscStudentCount: 100,
    });
    queryDocument.mockImplementationOnce(() => Promise.resolve(fakeDoc));

    const res = await request(application).get("/");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasReadAdmin).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
    done();
  });
});
