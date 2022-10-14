const testConfig = require("firebase-functions-test")();
const { makeDocumentSnapshot } = require("firebase-functions-test/lib/providers/firestore");
const request = require("supertest");
const { application } = require("../../../controllers/application/index");
const { queryDocument } = require("../../../utils/database");
const { jwtCheck, hasUpdateApp } = require("../../../utils/middleware");

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

describe("Confirm Position Test", () => {
  jwtCheck.mockImplementation((req, res, next) => {
    req.user = { sub: "test user" };
    next();
  });

  hasUpdateApp.mockImplementation((req, res, next) => {
    next();
  });

  afterEach(() => {
    jwtCheck.mockClear();
    hasUpdateApp.mockClear();
  });

  it("Should Return Code 200, status changed to confirmed", async () => {
    const fakeDoc = makeDocumentSnapshot({ status: "accepted" });
    queryDocument.mockImplementation(() => Promise.resolve(fakeDoc));
    fakeDoc.ref.update = jest.fn().mockImplementation((_) => Promise.resolve());
    const res = await request(application).put("/confirmposition");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({ code: 200, message: "Application Confirmed" });
  });

  it("Should Return Code 500 because status is not accepted", async () => {
    const fakeDoc = makeDocumentSnapshot({ status: "pending" });
    queryDocument.mockImplementation(() => Promise.resolve(fakeDoc));
    fakeDoc.ref.update = jest.fn().mockImplementation((_) => Promise.resolve());
    const res = await request(application).put("/confirmposition");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(500);
    expect(res.body).toStrictEqual({ code: 500, message: "Current Status Is Not Equal To Accepted" });
  });
});
