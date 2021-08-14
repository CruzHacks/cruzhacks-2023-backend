const testConfig = require("firebase-functions-test")();
const supertest = require("supertest");
const axios = require("axios");
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

const data = {
  user_id: "fake id",
};

jest.mock("../../../utils/middleware");
jest.mock("axios", () => jest.fn(() => Promise.resolve("Data sent")));

describe("Supertest", () => {
  afterEach(() => {
    jwtCheck.mockClear();
  });

  it("Should Return 201", (done) => {
    jwtCheck.mockImplementation((req, res, next) => next());
    return supertest(app)
      .post("/resend")
      .send(data)
      .expect(201)
      .then((res) => {
        expect(axios).toHaveBeenCalled();
        expect(res.text).toBe("Verification Email Sent");
        done();
      })
      .catch((err) => done(err));
  });
});
