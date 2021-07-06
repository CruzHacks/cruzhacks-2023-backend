const testConfig = require("firebase-functions-test")();
const { helloWorld } = require("../../index");



testConfig.mockConfig({
  test: {
    key: "IndexTest",
  },
  projconfig: {
    projectid: "projectId",
  },
});

const response = {
  status: (status) => {
    response.statusCode = status;
    return response;
  },
  send: ({ message, body, total }) => {
    response.body = {
      body: body,
      message: message,
      total: total,
    };
    return response;
  },
  set: () => {},
};

describe("Testing helloWorld", () => {
  it("This should send a response", async () => {
    const request = {
      headers: {
        origin: "http://www.cruzhacks.com",
      },
      method: "GET",
    };

    await helloWorld(request, response);
    expect(response.body.body).not.toBeNull();
    expect(response.body.message).toBe("Hello from Firebase!");
  });
});
