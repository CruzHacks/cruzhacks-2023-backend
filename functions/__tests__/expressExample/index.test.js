const testConfig = require("firebase-functions-test")();
const supertest = require("supertest");
const { addDocument, queryDocument } = require("../../Utils/database");
const { app } = require("../../controllers/expressExample/index");

testConfig.mockConfig({
  document: {
    key: "value",
  },
});

jest.mock("../../Utils/database");

describe("Supertest", () => {
  it("Should Return 200", (done) => {
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

  it("Should Return 500", (done) => {
    addDocument.mockImplementation(() => {
      throw new error();
    });
    queryDocument.mockImplementation(() => {
      () => {
        "document";
      };
    });
    return supertest(app)
      .get("/")
      .expect(500)
      .then((res) => {
        expect(res.body.code).toBe(500);
        done();
      })
      .catch((err) => done(err));
  });
});
