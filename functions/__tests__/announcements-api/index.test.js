const testConfig = require("firebase-functions-test")();
const supertest = require("supertest");
const { hasPermission } = require("../../utils/middleware");
const { announcements } = require("../../controllers/announcements-api/index");
const { addDocument, queryCollectionSorted, deleteDocument } = require("../../utils/database");

testConfig.mockConfig({
  auth: {
    cors: "site",
    audience: "audience",
    issuer: "issuer",
    jwk_uri: "some uri",
  },
});

jest.mock("../../utils/database");
jest.mock("../../utils/middleware");

describe("tests announcements", () => {
  hasPermission.mockImplementation((req, res, next) => next());

  describe("POST /announcements", () => {

  });
  describe("GET /announcements", () => {
    queryCollectionSorted.mockImplementation((collection, opts) => {
      return Promise.resolve([]);
    })
    it("Should respond with status code 200, and proper response data", async () => {
      const response = await supertest(announcements).get("/");
      expect(queryCollectionSorted).toHaveBeenCalled(1);
      expect(response.statusCode).toBe(200);
    });
    
  });
  describe("DELETE /announcements", () => {
    
  });
});