const testConfig = require("firebase-functions-test")();
const request = require("supertest");
const { application, jwtCheck } = require("../../../controllers/application/index");
const { hasReadApp } = require("../../../utils/middleware");
const { queryDocument } = require("../../../utils/database");
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
});

jest.mock("../../../utils/middleware");
jest.mock("../../../utils/database");
jest.mock("../../../controllers/application/index", () => ({
  ...jest.requireActual("../../controllers/application/index"),
  jwtCheck: jest.fn(),
}));
describe("Application Test", () => {
  afterEach(() => {
    jwtCheck.mockClear();
    hasReadApp.mockClear();
  });

  it("Should Return code 200, status: accepted, and exists: true", async () => {
    jwtCheck.mockImplementation((req, res, next) => {
      req.user = { sub: "test user" };
      next();
    });

    hasReadApp.mockImplementation((req, res, next) => {
      next();
    });

    fakeDoc = makeDocumentSnapshot({ status: "accepted" });
    queryDocument.mockImplementation(() => Promise.resolve(fakeDoc));

    const res = await request(application).get("/checkApp");
    expect(jwtCheck).toHaveBeenCalledTimes(1);

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      code: 200,
      status: "accepted",
      exists: true,
      message: "Document Found",
    });
  });

  it("Should Return code 200, status: rejected, and exists: true", async () => {
    jwtCheck.mockImplementation((req, res, next) => {
      req.user = { sub: "test user" };
      next();
    });

    hasReadApp.mockImplementation((req, res, next) => {
      next();
    });

    fakeDoc = makeDocumentSnapshot({ status: "rejected" });
    queryDocument.mockImplementation(() => Promise.resolve(fakeDoc));

    const res = await request(application).get("/checkApp");
    expect(jwtCheck).toHaveBeenCalledTimes(1);

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      code: 200,
      status: "rejected",
      exists: true,
      message: "Document Found",
    });
  });

  it("Should Return code 200, and exists: false", async () => {
    jwtCheck.mockImplementation((req, res, next) => {
      req.user = { sub: "test user" };
      next();
    });

    hasReadApp.mockImplementation((req, res, next) => {
      next();
    });

    queryDocument.mockImplementation(() => Promise.reject(new Error("No Document")));

    const res = await request(application).get("/checkApp");
    expect(jwtCheck).toHaveBeenCalledTimes(1);

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      code: 200,
      status: "No Document",
      exists: false,
      message: "No Document",
    });
  });

  it("Should Return code 500, and exists: false", async () => {
    jwtCheck.mockImplementation((req, res, next) => {
      req.user = { sub: "test user" };
      next();
    });

    hasReadApp.mockImplementation((req, res, next) => {
      next();
    });

    queryDocument.mockImplementation(() => Promise.reject(new Error()));

    const res = await request(application).get("/checkApp");
    expect(jwtCheck).toHaveBeenCalledTimes(1);

    expect(res.status).toBe(500);
    expect(res.body).toStrictEqual({
      code: 500,
      status: "No Document",
      exists: false,
      message: "Internal Server Error",
    });
  });
});
