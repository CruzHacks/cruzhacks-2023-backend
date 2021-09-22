const testConfig = require("firebase-functions-test")();
const supertest = require("supertest");
const { verifyRecaptcha } = require("../../controllers/VerifyRecaptcha/index");
jest.mock("isomorphic-fetch");
const fetch = require("isomorphic-fetch");
const { validKey } = require("../../utils/middleware");

testConfig.mockConfig({
  verify_recaptcha: {
    base_google_endpoint: "site",
    secret_key: "token",
  },
});
jest.mock("../../utils/middleware");

describe("POST /submit", () => {
  validKey.mockImplementation((req, res, next) => next());
  describe("Given no captcha token", () => {
    it("should respond with a 401 status code", async () => {
      const response = await supertest(verifyRecaptcha).post("/submit").send({});
      expect(response.statusCode).toBe(400);
    });
  });
  describe("Test cases with mocked fetching", () => {
    afterEach(() => fetch.mockClear);
    it("should respond with 500 status code with invalid response", async () => {
      fetch.mockReturnValue(Promise.resolve({ json: () => Promise.resolve() }));
      const response = await supertest(verifyRecaptcha).post("/submit").set({ token: "token" });
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(response.statusCode).toBe(500);
    });

    it("should respond with status code 200 with valid token and input secret", async () => {
      fetch.mockReturnValue(Promise.resolve({ json: () => Promise.resolve({ success: true }) }));
      const response = await supertest(verifyRecaptcha).post("/submit").set({ token: "token" });
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Successfully Validated Request");
    });
    it("should respond with status code 400 with invalid token and input secret", async () => {
      fetch.mockReturnValue(
        Promise.resolve({
          json: () =>
            Promise.resolve({ success: false, "error-codes": ["invalid-input-response", "invalid-input-secret"] }),
        }),
      );
      const response = await supertest(verifyRecaptcha).post("/submit").set({ token: "token" });
      expect(fetch).toHaveBeenCalledTimes(3);
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Invalid Token or Secret");
    });
    it("should respond with status code 400 with invalid token", async () => {
      fetch.mockReturnValue(
        Promise.resolve({
          json: () => Promise.resolve({ success: false, "error-codes": ["invalid-input-response"] }),
        }),
      );
      const response = await supertest(verifyRecaptcha).post("/submit").set({ token: "token" });
      expect(fetch).toHaveBeenCalledTimes(4);
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Invalid Token");
    });
    it("should respond with status code 401 with invalid secret", async () => {
      fetch.mockReturnValue(
        Promise.resolve({
          json: () => Promise.resolve({ success: false, "error-codes": ["invalid-input-secret"] }),
        }),
      );
      const response = await supertest(verifyRecaptcha).post("/submit").set({ token: "token" });
      expect(fetch).toHaveBeenCalledTimes(5);
      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe("Invalid Secret");
    });
    it("should respond with status code 400 with timeout or duplicate", async () => {
      fetch.mockReturnValue(
        Promise.resolve({
          json: () => Promise.resolve({ success: false, "error-codes": ["timeout-or-duplicate"] }),
        }),
      );
      const response = await supertest(verifyRecaptcha).post("/submit").set({ token: "token" });
      expect(fetch).toHaveBeenCalledTimes(6);
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Request timed out, or Duplicate key");
    });
  });
});
