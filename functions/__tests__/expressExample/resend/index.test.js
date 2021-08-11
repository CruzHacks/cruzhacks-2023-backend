const testConfig = require("firebase-functions-test")();
const supertest = require("supertest");
const { app } = require("../../../controllers/expressExample/index");
const { jwtCheck } = require("../../../utils/middleware");

testConfig.mockConfig({
  auth: {
    cors: "site",
    audience: "audience",
    issuer: "issuer",
    jwk_uri: "some uri",
  },
});

jest.mock("../../../utils/middleware");

describe("Supertest", () => {
  afterEach(() => {
    jwtCheck.mockClear();
  });

  it("Should Return 201", (done) => {
    jwtCheck.mockImplementation((req, res, next) => next());
    return supertest(app)
      .post("/resend")
      .expect(201)
      .then((res) => {
        expect(res.body.message).toBe("private body reached");
        done();
      })
      .catch((err) => done(err));
  });
});
