const testConfig = require("firebase-functions-test")();
const request = require("supertest");
const axios = require("axios");
const { app } = require("../../../controllers/auth/index");
const { jwtCheck } = require("../../../utils/middleware");
const { getM2MToken } = require("../../../utils/m2m");

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
  client_vars: {
    client_id: "my-id",
    client_secret: "my_secret",
  },
});

jest.mock("../../../utils/middleware");
jest.mock("../../../utils/m2m");
jest.mock("axios", () => jest.fn());

describe("Supertest", () => {
  beforeEach(() => {
    // eslint-disable-next-line no-unused-vars
    getM2MToken.mockImplementationOnce((client_id, client_secret, issuer) => Promise.resolve("token"));
  });
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

describe("user metadata", () => {
  beforeEach(() => {
    getM2MToken((client_id, client_secret, issuer) => Promise.resolve("token"));
  });
  afterEach(() => {
    jwtCheck.mockClear();
    axios.mockClear();
  });

  it("PATCH Should fail on no theme", async (done) => {
    jwtCheck.mockImplementation((req, res, next) => {
      req.user = { sub: "test user" };
      next();
    });

    const res = await request(app).patch("/metadata");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(axios).toHaveBeenCalledTimes(0);
    expect(res.status).toBe(400);
    done();
  });

  it("PATCH Should fail on invalid theme", async (done) => {
    jwtCheck.mockImplementation((req, res, next) => {
      req.user = { sub: "test user" };
      next();
    });

    const res = await request(app).patch("/metadata").send({ theme: "pink" });
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(axios).toHaveBeenCalledTimes(0);
    expect(res.status).toBe(400);
    done();
  });

  it("PATCH Should succeed on valid theme", async (done) => {
    jwtCheck.mockImplementation((req, res, next) => {
      req.user = { sub: "test user" };
      next();
    });
    axios.mockImplementationOnce(() => Promise.resolve({ status: 200 }));

    const res = await request(app).patch("/metadata").send({ theme: "light" });
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(axios).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
    done();
  });

  it("GET Should fail on no metadata return", async (done) => {
    jwtCheck.mockImplementation((req, res, next) => {
      req.user = { sub: "test user" };
      next();
    });
    axios.mockImplementationOnce(() => Promise.resolve({ status: 200 }));

    const res = await request(app).get("/metadata");

    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(axios).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(404);
    done();
  });

  it("GET Should succeed on metadata return", async (done) => {
    jwtCheck.mockImplementation((req, res, next) => {
      req.user = { sub: "test user" };
      next();
    });
    axios
      .mockImplementationOnce(() => Promise.resolve({ data: { user_metadata: { theme: "dark" } } }))
      .mockImplementationOnce(() => Promise.resolve({ status: 200 }));

    const res = await request(app).get("/metadata");

    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(axios).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
    done();
  });
});
