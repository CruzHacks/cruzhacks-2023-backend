const testConfig = require("firebase-functions-test")();
const request = require("supertest");
const { applicant } = require("../../controllers/applicants/index");
const { jwtCheck, hasReadAdmin } = require("../../utils/middleware");
const { makeDocumentSnapshot } = require("firebase-functions-test/lib/providers/firestore");
const { queryDocument } = require("../../utils/database");

jest.mock("../../utils/database");
jest.mock("../../utils/middleware");

testConfig.mockConfig({
  auth: {
    cors: "site",
    audience: "audience",
    issuer: "issuer",
    jwk_uri: "some uri",
  },
  api: {
    api_token: "sometoken",
  },
});

describe("Get Applicant by ID Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jwtCheck.mockImplementation((req, res, next) => {
      next();
    });

    hasReadAdmin.mockImplementation((req, res, next) => {
      next();
    });
  });
  it("Should return applicant", async (done) => {
    const fakeApplicant = makeDocumentSnapshot({
      id: 1,
      name: "Dummy",
      age: "20",
      major: "Computer Engineering",
      status: "Accepted",
    });
    queryDocument.mockImplementationOnce(() => Promise.resolve(fakeApplicant));

    const res = await request(applicant).get("/applicant/1");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasReadAdmin).toHaveBeenCalledTimes(1);
    console.info(res.body.message);
    expect(res.status).toBe(200);
    done();
  });
});
