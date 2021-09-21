const testConfig = require("firebase-functions-test")();
const supertest = require("supertest");
const { announcements } = require("../../../controllers/announcements-api/index");
const { validKey } = require("../../../utils/middleware");
const { queryCollectionSorted } = require("../../../utils/database");

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

describe("Testing Get All Announcements", () => {
  beforeEach(() => {
    validKey.mockImplementation((req, res, next) => next());
  });

  it("Should respond with 200 and Empty Array", async () => {
    queryCollectionSorted.mockImplementationOnce(() => Promise.resolve([]));
    const response = await supertest(announcements).get("/");
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Request success, announcements retrieved");
    expect(response.body.announcements).toBe("[]");
    expect(response.body.count).toBe(0);
  });

  it("Should respond with 200 and Empty Array", async () => {
    queryCollectionSorted.mockImplementationOnce(() =>
      Promise.resolve([
        {
          id: "id",
          data: function () {
            return { title: "title", message: "message", timeStamp: "today" };
          },
        },
        {
          id: "id2",
          data: function () {
            return { title: "title2", message: "message2", timeStamp: "tomorrow" };
          },
        },
      ]),
    );
    const response = await supertest(announcements).get("/");
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Request success, announcements retrieved");
    expect(response.body.announcements).toBe(
      '[{"id":"id","title":"title","message":"message","timeStamp":"today"},{"id":"id2","title":"title2","message":"message2","timeStamp":"tomorrow"}]',
    );
    expect(response.body.count).toBe(2);
  });

  it("Should return 500 Server Error", async () => {
    queryCollectionSorted.mockImplementationOnce(() => Promise.resolve(new Error("Some Error")));
    const response = await supertest(announcements).get("/");
    expect(response.statusCode).toBe(500);
    expect(response.body.message).toBe("Internal Server Error");
  });
});
