const supertest = require("supertest");
const { announcements } = require("../../controllers/announcements-api/index");

testConfig.mockConfig({
    auth: {
      cors: "site",
      audience: "audience",
      issuer: "issuer",
      jwk_uri: "some uri",
    },
});

jest.mock("../../../utils/database");
jest.mock("../../../utils/middleware");

describe("tests announcements", () => {
    describe("POST /announcements", () => {

    });
    describe("GET /announcements", () => {

    });
    describe("DELETE /announcements", () => {

    });
});