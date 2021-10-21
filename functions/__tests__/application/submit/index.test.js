const testConfig = require("firebase-functions-test")();
const request = require("supertest");
const { application } = require("../../../controllers/application/index");
const { jwtCheck, hasUpdateApp } = require("../../../utils/middleware");
const { setDocument } = require("../../../utils/database");
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

describe("Given submit invalid form data", () => {
  afterEach(() => {
    jwtCheck.mockClear();
    hasUpdateApp.mockClear();
  });
  it("Should return 500 and proper error-code given nothing", async () => {
    jwtCheck.mockImplementation((req, res, next) => {
      req.user = { sub: "test user" };
      next();
    });

    hasUpdateApp.mockImplementation((req, res, next) => {
      next();
    });
    const res = await request(application).post("/submit");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Server Error");
  });

  it("Should return 400 and proper error-codes given empty email", async () => {
    jwtCheck.mockImplementation((req, res, next) => {
      req.user = { sub: "test user" };
      next();
    });
    hasUpdateApp.mockImplementation((req, res, next) => {
      next();
    });
    const res = await request(application).post("/submit").field("email", "");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("Email is Invalid");
  });

  it("Should return 400 and proper error-codes given email > 100chars", async () => {
    jwtCheck.mockImplementation((req, res, next) => {
      req.user = { sub: "test user" };
      next();
    });
    hasUpdateApp.mockImplementation((req, res, next) => {
      next();
    });
    const res = await request(application)
      .post("/submit")
      .field(
        "email",
        "oooooooooonnnnnnnnnneeeeeeeeeehhhhhhhhhhuuuuuuuuuunnnnnnnnnnddddddddddrrrrrrrrrreeeeeeeeeeddddddddddchars@email.com",
      );
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("Email is Invalid");
  });

  it("Should return 400 and proper error-codes given valid email", async () => {
    jwtCheck.mockImplementation((req, res, next) => {
      req.user = { sub: "test user" };
      next();
    });
    hasUpdateApp.mockImplementation((req, res, next) => {
      next();
    });
    const res = await request(application).post("/submit").field("email", "user@example.com");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).not.toStrictEqual("Email is Invalid");
  });

  it("Should return 400 and proper error-codes given empty first and last name", async () => {
    jwtCheck.mockImplementation((req, res, next) => {
      req.user = { sub: "test user" };
      next();
    });
    hasUpdateApp.mockImplementation((req, res, next) => {
      next();
    });
    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "")
      .field("lname", "");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("First Name is Empty");
    expect(res.body.errors[1]).toStrictEqual("Last Name is Empty");
  });

  it("Should return 400 and proper error-codes given first and last name too long", async () => {
    jwtCheck.mockImplementation((req, res, next) => {
      req.user = { sub: "test user" };
      next();
    });
    hasUpdateApp.mockImplementation((req, res, next) => {
      next();
    });
    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "JohnPaulJacobTheThirdFourthAndFifthButSometimesTheSixth")
      .field("lname", "PeabodyPearcexxxxxxxxxxxxxxxxx");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("First Name is Too Long");
    expect(res.body.errors[1]).toStrictEqual("Last Name is Too Long");
  });

  it("Should return 400 and proper error-codes given first and last name valid but other invalid fields", async () => {
    jwtCheck.mockImplementation((req, res, next) => {
      req.user = { sub: "test user" };
      next();
    });
    hasUpdateApp.mockImplementation((req, res, next) => {
      next();
    });
    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).not.toStrictEqual("First Name is Too Long");
    expect(res.body.errors[1]).not.toStrictEqual("Last Name is Too Long");
    expect(res.body.errors[0]).not.toStrictEqual("First Name is Empty");
    expect(res.body.errors[1]).not.toStrictEqual("Last Name is Empty");
  });

  it("Should return 400 and proper error-codes given empty phone number", async () => {
    jwtCheck.mockImplementation((req, res, next) => {
      req.user = { sub: "test user" };
      next();
    });
    hasUpdateApp.mockImplementation((req, res, next) => {
      next();
    });
    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("Phone Number is Empty");
  });

  it("Should return 400 and proper error-codes given phone number too long", async () => {
    jwtCheck.mockImplementation((req, res, next) => {
      req.user = { sub: "test user" };
      next();
    });
    hasUpdateApp.mockImplementation((req, res, next) => {
      next();
    });
    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "+1 (925)-111-1111");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("Phone Number is Too Long");
  });

  it("Should return 400 and proper error-codes given age too low", async () => {
    jwtCheck.mockImplementation((req, res, next) => {
      req.user = { sub: "test user" };
      next();
    });
    hasUpdateApp.mockImplementation((req, res, next) => {
      next();
    });
    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "3");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("Age is Too Low");
  });
});
