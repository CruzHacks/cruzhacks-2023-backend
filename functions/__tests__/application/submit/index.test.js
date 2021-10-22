const testConfig = require("firebase-functions-test")();
const request = require("supertest");
const { application } = require("../../../controllers/application/index");
const { jwtCheck, hasUpdateApp } = require("../../../utils/middleware");
const { setDocument, uploadFile } = require("../../../utils/database");

const pdf500kb = "__tests__/application/submit/500kb.pdf"
const pdf4mb = "__tests__/application/submit/4mb.pdf"

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
  beforeEach(() => {
    setDocument.mockImplementation(() => Promise.resolve("success"));
    uploadFile.mockImplementation(() => Promise.resolve("success"));
    jwtCheck.mockImplementation((req, res, next) => {
      req.user = { sub: "Auth0|12345" };
      next();
    });
    hasUpdateApp.mockImplementation((req, res, next) => {
      next();
    });
    // isValidFileData.mockImplementation((filedata) => true)
    // getNewFileName.mockImplementation(() => "test.pdf")
  });
  afterEach(() => {
    jwtCheck.mockClear();
    hasUpdateApp.mockClear();
    setDocument.mockClear();
    uploadFile.mockClear();
    // isValidFileData.mockClear();
    // getNewFileName.mockClear();
  });
  it("Should return 500 and proper error-code given nothing", async () => {
    const res = await request(application).post("/submit");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Server Error");
  });

  it("Should return 400 and proper error-codes given empty email", async () => {

    const res = await request(application).post("/submit").field("email", "");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("Email is Invalid");
  });

  it("Should return 400 and proper error-codes given email > 100chars", async () => {

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

    const res = await request(application).post("/submit").field("email", "user@example.com");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).not.toStrictEqual("Email is Invalid");
  });

  it("Should return 400 and proper error-codes given empty first and last name", async () => {

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

  it("Should return 400 and proper error-codes given age too high", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "100");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("Age is Too High");
  });

  it("Should return 400 and proper error-codes given no pronouns selected", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronouns", "");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("No Pronouns Selected");
  });

  it("Should return 400 and proper error-codes too many pronouns", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 5);
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("Too Big of an Array");
  });

  it("Should return 400 and proper error-codes pronouns not parseable", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("Pronoun Input Not Parsable");
  });

  it("Should return 400 and proper error-codes sexuality empty", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 0);
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[1]).toStrictEqual("No Sexuality Selected");
  });

  it("Should return 400 and proper error-codes too many sexualities", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 9);
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[1]).toStrictEqual("Too Big of an Array");
  });

  it("Should return 400 and proper error-codes sexuality cant be parsed", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 1)
      .field("sexuality[0]", "");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[1]).toStrictEqual("Sexuality Input Not Parsable");
  });

  it("Should return 400 and proper error-codes race is empty", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 1)
      .field("sexuality[0]", "bisexual");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("No Race Inputted");
  });

  it("Should return 400 and proper error-codes race is too long", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 1)
      .field("sexuality[0]", "bisexual")
      .field("race", "RedOrangeYellowGreenBlueIndigoViolet if that isn't 50 chars long I give up");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("Race String Too Long");
  });

  it("Should return 400 and proper error-codes school empty", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 1)
      .field("sexuality[0]", "bisexual")
      .field("race", "Turkey man")
      .field("school", "");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("No School Inputted");
  });

  it("Should return 400 and proper error-codes school too long", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 1)
      .field("sexuality[0]", "bisexual")
      .field("race", "Turkey man")
      .field(
        "school",
        "University of the northwestern part of central alaska of the eastern seaboard's charcuterie board's smorgesbrod",
      );
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("School Input too Long");
  });

  it("Should return 400 and proper error-codes UCSC student but no college specified", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 1)
      .field("sexuality[0]", "bisexual")
      .field("race", "Turkey man")
      .field("school", "ucsc");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("Invalid College Affiliation");
  });

  it("Should return 400 and proper error-codes invalid event location", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 1)
      .field("sexuality[0]", "bisexual")
      .field("race", "Turkey man")
      .field("school", "UOP")
      .field("eventLocation", 5);
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("Not a valid event location");
  });

  it("Should return 400 and proper error-codes major is empty", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 1)
      .field("sexuality[0]", "bisexual")
      .field("race", "Turkey man")
      .field("school", "UOP")
      .field("eventLocation", "On-campus at UC Santa Cruz");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("No major inputted");
  });

  it("Should return 400 and proper error-codes major name too long", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 1)
      .field("sexuality[0]", "bisexual")
      .field("race", "Turkey man")
      .field("school", "UOP")
      .field("eventLocation", "On-campus at UC Santa Cruz")
      .field("major", "agricultural psychological computational anthropological engineering BSC");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("Major Name Too Long");
  });

  it("Should return 400 and proper error-codes given currentStanding empty", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 1)
      .field("sexuality[0]", "bisexual")
      .field("race", "Turkey man")
      .field("school", "UOP")
      .field("eventLocation", "On-campus at UC Santa Cruz")
      .field("major", "Computer Science");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("No standing inputted");
  });

  it("Should return 400 and proper error-codes given currentStanding too long", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 1)
      .field("sexuality[0]", "bisexual")
      .field("race", "Turkey man")
      .field("school", "UOP")
      .field("eventLocation", "On-campus at UC Santa Cruz")
      .field("major", "Computer Science")
      .field("currentStanding", "Standing on a shelf in my kitchenette, oh you meant academic standing whoops");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("Standing Name Too Long");
  });

  it("Should return 400 and proper error-codes given country empty", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 1)
      .field("sexuality[0]", "bisexual")
      .field("race", "Turkey man")
      .field("school", "UOP")
      .field("eventLocation", "On-campus at UC Santa Cruz")
      .field("major", "Computer Science")
      .field("currentStanding", "I am actually sitting");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("No country inputted");
  });

  it("Should return 400 and proper error-codes given country name too long", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 1)
      .field("sexuality[0]", "bisexual")
      .field("race", "Turkey man")
      .field("school", "UOP")
      .field("eventLocation", "On-campus at UC Santa Cruz")
      .field("major", "Computer Science")
      .field("currentStanding", "I am actually sitting")
      .field("country", "The United Kingdom of Great Britain and Northern Ireland");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("Country Name Too Long");
  });

  it("Should return 400 and proper error-codes given empty Why CruzHacks", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 1)
      .field("sexuality[0]", "bisexual")
      .field("race", "Turkey man")
      .field("school", "UOP")
      .field("eventLocation", "On-campus at UC Santa Cruz")
      .field("major", "Computer Science")
      .field("currentStanding", "I am actually sitting")
      .field("country", "USA")
      .field("whyCruzHacks", "");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("No response for Why CruzHacks");
  });

  it("Should return 400 and proper error-codes given Long Why CruzHacks", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 1)
      .field("sexuality[0]", "bisexual")
      .field("race", "Turkey man")
      .field("school", "UOP")
      .field("eventLocation", "On-campus at UC Santa Cruz")
      .field("major", "Computer Science")
      .field("currentStanding", "I am actually sitting")
      .field("country", "USA")
      .field(
        "whyCruzHacks",
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      );
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("Why Cruzhacks response too Long");
  });

  it("Should return 400 and proper error-codes given empty New This Year", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 1)
      .field("sexuality[0]", "bisexual")
      .field("race", "Turkey man")
      .field("school", "UOP")
      .field("eventLocation", "On-campus at UC Santa Cruz")
      .field("major", "Computer Science")
      .field("currentStanding", "I am actually sitting")
      .field("country", "USA")
      .field("whyCruzHacks", "Yes")
      .field("newThisYear", "");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("No response for New This Year");
  });

  it("Should return 400 and proper error-codes given Long New This Year", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 1)
      .field("sexuality[0]", "bisexual")
      .field("race", "Turkey man")
      .field("school", "UOP")
      .field("eventLocation", "On-campus at UC Santa Cruz")
      .field("major", "Computer Science")
      .field("currentStanding", "I am actually sitting")
      .field("country", "USA")
      .field("whyCruzHacks", "Yes")
      .field(
        "newThisYear",
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      );
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("New This Year response too Long");
  });

  it("Should return 400 and proper error-codes given empty Grandest Invention", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 1)
      .field("sexuality[0]", "bisexual")
      .field("race", "Turkey man")
      .field("school", "UOP")
      .field("eventLocation", "On-campus at UC Santa Cruz")
      .field("major", "Computer Science")
      .field("currentStanding", "I am actually sitting")
      .field("country", "USA")
      .field("whyCruzHacks", "Yes")
      .field("newThisYear", "2022 Hackathon")
      .field("grandestInvention", "");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("No response for Grandest Invention");
  });

  it("Should return 400 and proper error-codes given Long Grandest Invention", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 1)
      .field("sexuality[0]", "bisexual")
      .field("race", "Turkey man")
      .field("school", "UOP")
      .field("eventLocation", "On-campus at UC Santa Cruz")
      .field("major", "Computer Science")
      .field("currentStanding", "I am actually sitting")
      .field("country", "USA")
      .field("whyCruzHacks", "Yes")
      .field("newThisYear", "2022 Hackathon")
      .field(
        "grandestInvention",
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      );
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("Grandest Invention response too Long");
  });

  it("Should return 400 and proper error-codes given Missing Hackathon Count", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 1)
      .field("sexuality[0]", "bisexual")
      .field("race", "Turkey man")
      .field("school", "UOP")
      .field("eventLocation", "On-campus at UC Santa Cruz")
      .field("major", "Computer Science")
      .field("currentStanding", "I am actually sitting")
      .field("country", "USA")
      .field("whyCruzHacks", "Yes")
      .field("newThisYear", "2022 Hackathon")
      .field("grandestInvention", "Jest Test");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("Invalid Hackathon Count");
  });

  it("Should return 400 and proper error-codes given Negative Hackathon Count", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 1)
      .field("sexuality[0]", "bisexual")
      .field("race", "Turkey man")
      .field("school", "UOP")
      .field("eventLocation", "On-campus at UC Santa Cruz")
      .field("major", "Computer Science")
      .field("currentStanding", "I am actually sitting")
      .field("country", "USA")
      .field("whyCruzHacks", "Yes")
      .field("newThisYear", "2022 Hackathon")
      .field("grandestInvention", "Jest Test")
      .field("hackathonCount", "-5");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("Invalid Hackathon Count");
  });

  it("Should return 400 and proper error-codes given Large Hackathon Count", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 1)
      .field("sexuality[0]", "bisexual")
      .field("race", "Turkey man")
      .field("school", "UOP")
      .field("eventLocation", "On-campus at UC Santa Cruz")
      .field("major", "Computer Science")
      .field("currentStanding", "I am actually sitting")
      .field("country", "USA")
      .field("whyCruzHacks", "Yes")
      .field("newThisYear", "2022 Hackathon")
      .field("grandestInvention", "Jest Test")
      .field("hackathonCount", "1000");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("Too many hackathons attended");
  });

  it("Should return 400 and proper error-codes given Large Hackathon Count", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 1)
      .field("sexuality[0]", "bisexual")
      .field("race", "Turkey man")
      .field("school", "UOP")
      .field("eventLocation", "On-campus at UC Santa Cruz")
      .field("major", "Computer Science")
      .field("currentStanding", "I am actually sitting")
      .field("country", "USA")
      .field("whyCruzHacks", "Yes")
      .field("newThisYear", "2022 Hackathon")
      .field("grandestInvention", "Jest Test")
      .field("hackathonCount", "1000");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("Too many hackathons attended");
  });

  it("Should return 400 and proper error-codes given Long Prior Experience", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 1)
      .field("sexuality[0]", "bisexual")
      .field("race", "Turkey man")
      .field("school", "UOP")
      .field("eventLocation", "On-campus at UC Santa Cruz")
      .field("major", "Computer Science")
      .field("currentStanding", "I am actually sitting")
      .field("country", "USA")
      .field("whyCruzHacks", "Yes")
      .field("newThisYear", "2022 Hackathon")
      .field("grandestInvention", "Jest Test")
      .field("hackathonCount", "0")
      .field(
        "priorExperience",
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      );
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("Prior Experience response too Long");
  });

  it("Should return 400 and proper error-codes given Long LinkedIn Id", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 1)
      .field("sexuality[0]", "bisexual")
      .field("race", "Turkey man")
      .field("school", "UOP")
      .field("eventLocation", "On-campus at UC Santa Cruz")
      .field("major", "Computer Science")
      .field("currentStanding", "I am actually sitting")
      .field("country", "USA")
      .field("whyCruzHacks", "Yes")
      .field("newThisYear", "2022 Hackathon")
      .field("grandestInvention", "Jest Test")
      .field("hackathonCount", "0")
      .field(
        "linkedin",
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      );
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("LinkedIn Id too Long");
  });

  it("Should return 400 and proper error-codes given Long Github Id", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 1)
      .field("sexuality[0]", "bisexual")
      .field("race", "Turkey man")
      .field("school", "UOP")
      .field("eventLocation", "On-campus at UC Santa Cruz")
      .field("major", "Computer Science")
      .field("currentStanding", "I am actually sitting")
      .field("country", "USA")
      .field("whyCruzHacks", "Yes")
      .field("newThisYear", "2022 Hackathon")
      .field("grandestInvention", "Jest Test")
      .field("hackathonCount", "0")
      .field(
        "github",
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      );
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("GitHub Id too Long");
  });

  it("Should return 400 and proper error-codes given Long Cruz Coins Reponse", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 1)
      .field("sexuality[0]", "bisexual")
      .field("race", "Turkey man")
      .field("school", "UOP")
      .field("eventLocation", "On-campus at UC Santa Cruz")
      .field("major", "Computer Science")
      .field("currentStanding", "I am actually sitting")
      .field("country", "USA")
      .field("whyCruzHacks", "Yes")
      .field("newThisYear", "2022 Hackathon")
      .field("grandestInvention", "Jest Test")
      .field("hackathonCount", "0")
      .field(
        "cruzCoins",
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      );
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("CruzCoins response too Long");
  });

  it("Should return 400 and proper error-codes given Long Anything Else", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 1)
      .field("sexuality[0]", "bisexual")
      .field("race", "Turkey man")
      .field("school", "UOP")
      .field("eventLocation", "On-campus at UC Santa Cruz")
      .field("major", "Computer Science")
      .field("currentStanding", "I am actually sitting")
      .field("country", "USA")
      .field("whyCruzHacks", "Yes")
      .field("newThisYear", "2022 Hackathon")
      .field("grandestInvention", "Jest Test")
      .field("hackathonCount", "0")
      .field(
        "anythingElse",
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      );
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Form Validation Failed");
    expect(res.body.errors[0]).toStrictEqual("Anything Else response too Long");
  });

  it("Should return 200 given Valid Response with No File", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 1)
      .field("sexuality[0]", "bisexual")
      .field("race", "Turkey man")
      .field("school", "UOP")
      .field("eventLocation", "On-campus at UC Santa Cruz")
      .field("major", "Computer Science")
      .field("currentStanding", "I am actually sitting")
      .field("country", "USA")
      .field("whyCruzHacks", "Yes")
      .field("newThisYear", "2022 Hackathon")
      .field("grandestInvention", "Jest Test")
      .field("hackathonCount", "0")
      .field("anythingElse", "");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Successfully Updated Application");
    expect(res.body.errors).toStrictEqual(undefined);
  });

  it("Should return 200 given Valid Response with No File", async () => {

    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 1)
      .field("sexuality[0]", "bisexual")
      .field("race", "Turkey man")
      .field("school", "UOP")
      .field("eventLocation", "On-campus at UC Santa Cruz")
      .field("major", "Computer Science")
      .field("currentStanding", "I am actually sitting")
      .field("country", "USA")
      .field("whyCruzHacks", "Yes")
      .field("newThisYear", "2022 Hackathon")
      .field("grandestInvention", "Jest Test")
      .field("hackathonCount", "0")
      .field("anythingElse", "");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Successfully Updated Application");
    expect(res.body.errors).toStrictEqual(undefined);
  });

  it("Should return 500 given Valid Response but Database Error", async () => {
    setDocument.mockImplementation(() => Promise.reject("Faild to Store"))
    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 1)
      .field("sexuality[0]", "bisexual")
      .field("race", "Turkey man")
      .field("school", "UOP")
      .field("eventLocation", "On-campus at UC Santa Cruz")
      .field("major", "Computer Science")
      .field("currentStanding", "I am actually sitting")
      .field("country", "USA")
      .field("whyCruzHacks", "Yes")
      .field("newThisYear", "2022 Hackathon")
      .field("grandestInvention", "Jest Test")
      .field("hackathonCount", "0")
      .field("anythingElse", "");
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Server Error");
    expect(res.body.errors).toStrictEqual(undefined);
  });


  it("Should return 400 given Valid Response with Large File", async () => {
    setDocument.mockImplementation(() => Promise.reject("Faild to Store"))
    const res = await request(application)
      .post("/submit")
      .field("email", "user@example.com")
      .field("fname", "Jacob")
      .field("lname", "Jacobi")
      .field("phone", "925-111-1111")
      .field("age", "24")
      .field("pronounCount", 1)
      .field("pronouns[0]", "he/him/his")
      .field("sexualityCount", 1)
      .field("sexuality[0]", "bisexual")
      .field("race", "Turkey man")
      .field("school", "UOP")
      .field("eventLocation", "On-campus at UC Santa Cruz")
      .field("major", "Computer Science")
      .field("currentStanding", "I am actually sitting")
      .field("country", "USA")
      .field("whyCruzHacks", "Yes")
      .field("newThisYear", "2022 Hackathon")
      .field("grandestInvention", "Jest Test")
      .field("hackathonCount", "0")
      .field("anythingElse", "")
      .attach("file", pdf4mb)
      .set({connection: 'keep-alive'})
    expect(jwtCheck).toHaveBeenCalledTimes(1);
    expect(hasUpdateApp).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Resume Validation Failed");
    expect(res.body.errors).toStrictEqual(["Document is greater than 1mb"]);
  });
});
