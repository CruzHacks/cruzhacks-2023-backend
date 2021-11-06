const testConfig = require("firebase-functions-test")();
const supertest = require("supertest");
const { announcements } = require("../../../controllers/announcements-api/index");
const { hasUpdateAnnouncement, jwtCheck } = require("../../../utils/middleware");
const { addDocument } = require("../../../utils/database");

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

describe("Testing Post Announcement", () => {
  hasUpdateAnnouncement.mockImplementation((req, res, next) => next());
  jwtCheck.mockImplementation((req, res, next) => {
    req.user = { sub: "test user" };
    next();
  });

  it("Should respond with 201 Success", async () => {
    addDocument.mockImplementation(() => Promise.resolve("firebase timestamp"));
    const response = await supertest(announcements)
      .post("/")
      .set("Accept", "application/json")
      .send({ message: "My Message", title: "A title" });
    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("Item successfully added.");
  });

  it("Should fail with 400 with Missing Title", async () => {
    addDocument.mockImplementation(() => Promise.resolve("firebase timestamp"));
    const response = await supertest(announcements)
      .post("/")
      .set("Accept", "application/json")
      .send({ message: "My message" });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Invalid title");
  });

  it("Should fail with 400 with Long Title", async () => {
    addDocument.mockImplementation(() => Promise.resolve("firebase timestamp"));
    const response = await supertest(announcements).post("/").set("Accept", "application/json").send({
      message: "My Message",
      title:
        "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec.",
    });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Invalid title");
  });

  it("Should fail with 400 with Invalid Title", async () => {
    addDocument.mockImplementation(() => Promise.resolve("firebase timestamp"));
    const response = await supertest(announcements)
      .post("/")
      .set("Accept", "application/json")
      .send({ message: "My Message", title: "+=+" });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Invalid title");
  });

  it("Should fail with 400 with Missing Message", async () => {
    addDocument.mockImplementation(() => Promise.resolve("firebase timestamp"));
    const response = await supertest(announcements)
      .post("/")
      .set("Accept", "application/json")
      .send({ title: "A title" });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Invalid Message");
  });

  it("Should fail with 400 with Long Message", async () => {
    addDocument.mockImplementation(() => Promise.resolve("firebase timestamp"));
    const response = await supertest(announcements).post("/").set("Accept", "application/json").send({
      message:
        "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec.",
      title: "A title",
    });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Invalid Message");
  });

  it("Should fail with 400 with Invalid Message", async () => {
    addDocument.mockImplementation(() => Promise.resolve("firebase timestamp"));
    const response = await supertest(announcements)
      .post("/")
      .set("Accept", "application/json")
      .send({ message: "?!()ad", title: "A title" });
    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("Item successfully added.");
  });

  it("Should fail with 500", async () => {
    addDocument.mockImplementationOnce(() => Promise.reject(new Error("Some Error")));
    const response = await supertest(announcements)
      .post("/")
      .set("Accept", "application/json")
      .send({ message: "My Message", title: "A title" });
    expect(response.statusCode).toBe(500);
    expect(response.body.message).toBe("Internal Server Error");
  });
});
