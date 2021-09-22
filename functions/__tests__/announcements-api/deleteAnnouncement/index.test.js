const testConfig = require("firebase-functions-test")();
const supertest = require("supertest");
const { announcements } = require("../../../controllers/announcements-api/index");
const { hasDeleteAnnouncement, jwtCheck } = require("../../../utils/middleware");
const { deleteDocument } = require("../../../utils/database");

jest.mock("../../../utils/database");
jest.mock("../../../utils/middleware");

testConfig.mockConfig({
  auth: {
    cors: "site",
    audience: "audience",
    issuer: "issuer",
    jwk_uri: "some uri",
  },
  api: {
    api_token: "sometoken",
  },
});

describe("Testing Deleting an Announcement", () => {
  hasDeleteAnnouncement.mockImplementation((req, res, next) => next());
  jwtCheck.mockImplementation((req, res, next) => {
    req.user = { sub: "test user" };
    next();
  });
  it("Should respond with 200 for existent Announcement", async () => {
    deleteDocument.mockImplementation(() => Promise.resolve({}));
    const response = await supertest(announcements).delete("/:id");
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Announcement successfully removed!");
  });

  it("Should respond with 200 for non-existent Announcement", async () => {
    deleteDocument.mockImplementation(() => Promise.resolve({}));
    const response = await supertest(announcements).delete("/:id");
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Announcement successfully removed!");
  });

  it("Should respond 500 Internal Server Error", async () => {
    deleteDocument.mockImplementation(() => Promise.reject(new Error("Some Server issue")));
    const response = await supertest(announcements).delete("/:id");
    expect(response.statusCode).toBe(500);
    expect(response.body.message).toBe("Internal Server Error");
  });
});
