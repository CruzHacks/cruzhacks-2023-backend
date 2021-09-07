const testConfig = require("firebase-functions-test")();
const supertest = require("supertest");
const { announcements } = require("../../controllers/announcements-api/index");
const { hasPermission } = require("../../utils/middleware");
const { addDocument, queryCollectionSorted, deleteDocument } = require("../../utils/database");

jest.mock("../../utils/database");
jest.mock("../../utils/middleware");

describe("test announcement endpoints", () => {
  hasPermission.mockImplementation((permission) => (req, res, next) => next());

  describe("GET: gets all announcements", () => {
    queryCollectionSorted.mockImplementation(() => []);
    it("Should respond with proper response codes and data", async () =>{
      const response = await supertest(announcements).get("/");
      expect(queryCollectionSorted).toHaveBeenCalledTimes(1);
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Request success, announcements retrieved");
      expect(response.body.announcements).toBe("[]");
    });
  });
  describe("DELETE: delete announcement by id", () => {
    deleteDocument.mockReturnValue(() => Promise.resolve({}));
    it("Should respond with proper response codes and data", async () => {
      const response = await supertest(announcements).delete("/:id");

    });
  });
});