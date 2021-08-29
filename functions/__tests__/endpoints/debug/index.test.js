const testConfig = require("firebase-functions-test")();
const supertest = require("supertest");
const { addDocument, queryDocument } = require("../../../utils/database");
const { app } = require("../../../controllers/endpoints/index");
const { jwtCheck } = require("../../../utils/middleware");

testConfig.mockConfig({
  document: {
    key: "value",
  },
  auth: {
    cors: "site",
    issuer: "n/a",
  },
});

jest.mock("../../../utils/database");
jest.mock("../../../utils/middleware");

describe("Supertest", () => {
  beforeEach(() => {
    jwtCheck.mockImplementation((req, res, next) => next());
  });

  afterEach(() => {
    addDocument.mockClear();
    queryDocument.mockClear();
  });

  it("Should Return 201", (done) => {
    addDocument.mockImplementation(() => 1);
    queryDocument.mockImplementation(() => {
      () => {
        "document";
      };
    });

    return supertest(app)
      .get("/")
      .expect(201)
      .then((res) => {
        expect(res.body.code).toBe(201);
        expect(res.body.message).toBe("Added data from db example");
        done();
      })
      .catch((err) => done(err));
  });
});
