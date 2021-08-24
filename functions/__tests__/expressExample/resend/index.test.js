const testConfig = require("firebase-functions-test")();
const request = require("supertest");
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
  api: {
    api_token: "sometoken",
    url: "fake_url",
  },
});

jest.mock("../../../utils/middleware");
jest.mock("axios", () => jest.fn());

describe("Supertest", () => {
  afterEach(() => {
    jwtCheck.mockClear();
    axios.mockClear();
  });

  it("Should Send an Unverified User an Authentication Email", async (done) => {
    jwtCheck.mockImplementation((req, res, next) => {
      req.user = { sub: "test user" };
      next();
    });
    axios
      .mockImplementationOnce(() => Promise.resolve({ data: { email_verified: false } }))
      .mockImplementationOnce(() => Promise.resolve({ status: 201 }));

    const res = await request(app).post("/resend");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(axios).toHaveBeenCalledTimes(2);
    expect(res.status).toBe(201);
    done();
  });

  it("Should Reject and Return 406 Because the User is Already Verified", async (done) => {
    jwtCheck.mockImplementation((req, res, next) => {
      req.user = { sub: "test user" };
      next();
    });
    axios.mockImplementationOnce(() => Promise.resolve({ data: { email_verified: true } }));

    const res = await request(app).post("/resend");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(axios).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(406);
    done();
  });

  it("Should Return an Unknown Error and Return 500", async (done) => {
    jwtCheck.mockImplementation((req, res, next) => {
      req.user = { sub: "test user" };
      next();
    });
    axios
      .mockImplementationOnce(() => Promise.resolve({ data: { email_verified: false } }))
      .mockImplementationOnce(() => Promise.reject(new Error({ status: 500, message: "Unexpected Issue" })));

    const res = await request(app).post("/resend");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(axios).toHaveBeenCalledTimes(2);
    expect(res.status).toBe(500);
    done();
  });
});
