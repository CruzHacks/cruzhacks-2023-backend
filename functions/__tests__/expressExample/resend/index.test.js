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
    email: "sometoken"
  }
);



jest.mock("../../../utils/middleware");
jest.mock("axios", () => jest.fn(() => Promise.resolve("Data sent")));

describe("Supertest", () => {
  afterEach(() => {
    jwtCheck.mockClear();
  });
  
  it("Should Return 201", async (done) => {
    jwtCheck.mockImplementation((req, res, next) => next());
    await supertest(app)
      .post("/resend")
      .set(
        {
          user : {
            sub: "some suer id"
          }
        }
      )
      .expect(201)
      .then((res) => {
        expect(axios).toHaveBeenCalled();
        expect(res.text).toBe("Verification Email Sent");
        done();
      })
      .catch((err) => done(err));
  });
});
