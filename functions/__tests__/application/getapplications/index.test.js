const { jwtCheck, hasReadAdmin } = require("../../../utils/middleware");
const request = require("supertest");
const { makeDocumentSnapshot } = require("firebase-functions-test/lib/providers/firestore");
const { queryCollection, db } = require("../../../utils/database");
const { application } = require("../../../controllers/application");

const testConfig = require("firebase-functions-test")();

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

jest.mock("../../../utils/database", () => ({ db: jest.fn(), queryCollection: jest.fn() }));

describe("Get Applications Test", () => {
  const app1 = {
    name: "fakeName",
    age: "fakeAge",
    major: "fakeMajor",
    status: "pending",
  };

  jwtCheck.mockImplementation((req, res, next) => {
    req.user = { sub: "test user" };
    next();
  });

  hasReadAdmin.mockImplementation((req, res, next) => {
    next();
  });

  const fakeDoc1 = makeDocumentSnapshot(app1);
  const fakeCollection = [fakeDoc1];

  afterEach(() => {
    jwtCheck.mockClear();
    hasReadAdmin.mockClear();
  });

  it("Should Return Code 200, along with all applications", async () => {
    queryCollection.mockImplementation(() => Promise.resolve(fakeCollection));
    const res = await request(application).get("/applications");
    expect(jwtCheck).toHaveBeenCalledTimes(1);

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      code: 200,
      applications: [{ ...app1, applicant_id: "undefined" }],
    });
  });

  it("Should Return Code 200, along with all applications with status pending", async () => {
    const fakeCol = () => ({
      where: () => ({
        get: () => Promise.resolve(fakeCollection),
      }),
    });
    db.collection = jest.fn().mockImplementation(fakeCol);

    const res = await request(application).get("/applications").query({ appStatus: "pending" });
    expect(jwtCheck).toHaveBeenCalledTimes(1);

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      code: 200,
      applications: [{ ...app1, applicant_id: "undefined" }],
    });
  });

  it("Should Return Code 500, because of invalid status input", async () => {
    const res = await request(application).get("/applications").query({ appStatus: "badInput" });
    expect(jwtCheck).toHaveBeenCalledTimes(1);

    expect(res.status).toBe(500);
    expect(res.body).toStrictEqual({
      code: 500,
      message: "Invalid Input",
    });
  });
});
