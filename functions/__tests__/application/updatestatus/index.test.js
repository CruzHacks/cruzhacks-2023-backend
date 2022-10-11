const testConfig = require("firebase-functions-test")();
const request = require("supertest");
const { application } = require("../../../controllers/application/index");
const { jwtCheck, hasReadApp, hasUpdateStatus } = require("../../../utils/middleware");
const { setDocument } = require("../../../utils/database");
const { makeDocumentSnapshot } = require("firebase-functions-test/lib/providers/firestore");

testConfig.mockConfig({
  auth: {
    cors: "site",
    audience: "audience",
    issuer: "issuer",
    jwk_uri: "some uri",
  },
  api: {
    api_token: "sometoken",
    url: "fake_url",
  },
  app: {
    bucket: "resume",
  },
});

jest.mock("../../../utils/middleware");
jest.mock("../../../utils/database");

describe("Application Test", () => {
  afterEach(() => {
    jwtCheck.mockClear();
    hasReadApp.mockClear();
  });

  it("Should Return code 400, missing request body", async () => {
    jwtCheck.mockImplementation((req, res, next) => {
      req.user = { sub: "test user" };
      next();
    });

    hasUpdateStatus.mockImplementation((req, res, next) => {
      next();
    });

    const body = {};

    const res = await request(application).put("/updatestatus/1234").send(body);
    expect(jwtCheck).toHaveBeenCalledTimes(1);

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      code: 400,
      message: "Missing 'status' in request body",
    });
  });

  it("Should Return code 400, invalid status", async () => {
    jwtCheck.mockImplementation((req, res, next) => {
      req.user = { sub: "test user" };
      next();
    });

    hasUpdateStatus.mockImplementation((req, res, next) => {
      next();
    });

    const body = { applicant_id: "test", status: "invalid option" };

    const res = await request(application).put("/updatestatus/1234").send(body);
    expect(jwtCheck).toHaveBeenCalledTimes(1);

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      code: 400,
      message: "Status must be ACCEPT, REJECT, or PENDING",
    });
  });

  it("Should Return code 200, successful application update", async () => {
    jwtCheck.mockImplementation((req, res, next) => {
      req.user = { sub: "test user" };
      next();
    });

    hasUpdateStatus.mockImplementation((req, res, next) => {
      next();
    });

    const body = { applicant_id: "test", status: "ACCEPT" };

    fakeDoc = makeDocumentSnapshot({ status: "ACCEPT" });
    setDocument.mockImplementation(() => Promise.resolve(fakeDoc));

    const res = await request(application).put("/updatestatus/1234").send(body);
    expect(jwtCheck).toHaveBeenCalledTimes(1);

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      code: 200,
      message: "Successfully Updated Application status for test user",
    });
  });
});
