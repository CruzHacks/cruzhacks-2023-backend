const {
  alphanumericPunctuationRegex,
  alphanumericPunctuationRegexWithNewLine,
  phoneRegex,
  emailRegex,
} = require("./regex");

/*
  Return Inteface

    status: enum(string)
    email: string
    fname: string
    lname: string
    phone: string
    age: integer
    pronouns: Array<string>
    sexuality: Array<string>
    race: string
    ucscStudent: boolean
    school: string
    collegeAffiliation: enum(string)
    eventLocation: enum(string)
    major: string
    currentStanding: string
    country: string
    whyCruzHacks: string
    newThisYear: string
    grandestInvention: string
    firstCruzHack: boolean
    hackathonCount: integer
    priorExperience: string
    linkedin: string
    github: string
    cruzCoins: string
    anythingElse: string
*/

const createAppObject = (body) => {
  try {
    const pronouns = [];
    const sexualities = [];
    const pronounCount = body["pronounCount"] ? parseInt(body["pronounCount"]) : 0;
    const sexualityCount = body["sexualityCount"] ? parseInt(body["sexualityCount"]) : 0;
    for (var i = 0; i < pronounCount; i++) {
      var pronoun = body[`pronouns[${i}]`];
      if (pronoun !== null && pronoun !== "") {
        pronouns.push(pronoun);
      }
    }
    for (var j = 0; j < sexualityCount; j++) {
      var sexuality = body[`sexuality[${j}]`];
      if (sexuality !== null && sexuality !== "") {
        sexualities.push(sexuality);
      }
    }

    const isUCSC = body["school"]
      ? body["school"].toLowerCase() === "ucsc" ||
        body["school"].toLowerCase() === "uc santa cruz" ||
        body["school"].toLowerCase() === "university of california, santa cruz" ||
        body["school"].toLowerCase() === "university of california-santa cruz"
      : false;
    const school = isUCSC ? "ucsc" : body["school"] ? body["school"] : "";
    const appObj = {
      // App Info
      status: "pending",
      // Contact Info
      email: body["email"] ? body["email"] : "",
      fname: body["fname"] ? body["fname"] : "",
      lname: body["lname"] ? body["lname"] : "",
      phone: body["phone"] ? body["phone"] : "",

      // Demographic
      age: body["age"] ? parseInt(body["age"]) : -1,
      pronouns: pronouns,
      sexuality: sexualities,
      race: body["race"] ? body["race"] : "",
      ucscStudent: isUCSC,
      school: school,
      collegeAffiliation: body["collegeAffiliation"],
      eventLocation: body["eventLocation"] ? body["eventLocation"] : "",
      major: body["major"] ? body["major"] : "",
      currentStanding: body["currentStanding"] ? body["currentStanding"] : "",
      country: body["country"] ? body["country"] : "",

      // Short Answer
      whyCruzHacks: body["whyCruzHacks"] ? body["whyCruzHacks"].replace(/(\r\n|\n|\r)/gm, " ") : "",
      newThisYear: body["newThisYear"] ? body["newThisYear"].replace(/(\r\n|\n|\r)/gm, " ") : "",
      grandestInvention: body["grandestInvention"] ? body["grandestInvention"].replace(/(\r\n|\n|\r)/gm, " ") : "",

      // Prior Experience
      firstCruzHack: body["firstCruzHack"] ? body["firstCruzHack"].toLowerCase() === "yes" : false,
      hackathonCount: body["hackathonCount"] ? parseInt(body["hackathonCount"]) : -1,
      priorExperience: body["priorExperience"] ? body["priorExperience"].replace(/(\r\n|\n|\r)/gm, " ") : "",

      // Connected
      linkedin: body["linkedin"] ? body["linkedin"] : "",
      github: body["github"] ? body["github"] : "",
      cruzCoins: body["cruzCoins"] ? body["cruzCoins"].replace(/(\r\n|\n|\r)/gm, " ") : "",
      anythingElse: body["anythingElse"] ? body["anythingElse"].replace(/(\r\n|\n|\r)/gm, " ") : "",
    };
    return appObj;
  } catch (error) {
    return null;
  }
};

const validateAppData = (data) => {
  const fields = [
    "email",
    "fname",
    "lname",
    "phone",
    "age",
    "pronouns",
    "race",
    "sexuality",
    "ucscStudent",
    "school",
    "collegeAffiliation",
    "eventLocation",
    "major",
    "currentStanding",
    "country",
    "whyCruzHacks",
    "newThisYear",
    "grandestInvention",
    "firstCruzHack",
    "hackathonCount",
    "priorExperience",
    "linkedin",
    "github",
    "cruzCoins",
    "anythingElse",
  ];
  let errors = [];

  fields.forEach((key) => {
    switch (key) {
      case "email": {
        if (data[key] === "" || data[key].length > 100 || emailRegex(data[key])) {
          errors.push("Email is Invalid");
        }
        break;
      }
      case "fname": {
        if (data[key] === "") {
          errors.push("First Name is Empty");
        } else if (data[key].length > 25) {
          errors.push("First Name is Too Long");
        } else if (data[key] && alphanumericPunctuationRegex(data[key])) {
          errors.push("First Name Invalid Alphanumeric");
        }
        break;
      }
      case "lname": {
        if (data[key] === "") {
          errors.push("Last Name is Empty");
        } else if (data[key].length > 25) {
          errors.push("Last Name is Too Long");
        } else if (data[key] && alphanumericPunctuationRegex(data[key])) {
          errors.push("Last Name Invalid Alphanumeric");
        }
        break;
      }
      case "phone": {
        if (data[key] === "") {
          errors.push("Phone Number is Empty");
        } else if (data[key].length > 20) {
          errors.push("Phone Number is Too Long");
        } else if (phoneRegex(data[key])) {
          errors.push("Phone Number Invalid");
        }
        break;
      }
      case "age": {
        if (data[key] < 13) {
          errors.push("Age is Too Low");
        } else if (data[key] > 99) {
          errors.push("Age is Too High");
        }
        break;
      }
      case "pronouns": {
        if (data[key].length === 0) {
          errors.push("No Pronouns Selected");
        } else if (data[key].length > 5) {
          errors.push("Too Big of an Array");
        } else {
          for (var i = 0; i < data[key].length; i++) {
            if (data[key][i] === "" || data[key][i].length > 50 || alphanumericPunctuationRegex(data[key[i]])) {
              errors.push("Pronoun Input Not Parsable");
              break;
            }
          }
        }
        break;
      }
      case "sexuality": {
        if (data[key].length === 0) {
          errors.push("No Sexuality Selected");
        } else if (data[key].length >= 5) {
          errors.push("Too Big of an Array");
        } else {
          for (var j = 0; j < data[key].length; j++) {
            if (data[key][j] === "" || data[key][j].length > 50 || alphanumericPunctuationRegex(data[key[j]])) {
              errors.push("Sexuality Input Not Parsable");
              break;
            }
          }
        }
        break;
      }
      case "race": {
        if (data[key] === "") {
          errors.push("No Race Inputted");
        } else if (data[key].length > 50) {
          errors.push("Race String Too Long");
        } else if (data[key] && alphanumericPunctuationRegex(data[key])) {
          errors.push("Race is not alphanumeric");
        }
        break;
      }
      case "school": {
        if (data[key].length === 0) {
          errors.push("No School Inputted");
        } else if (data[key].length > 100) {
          errors.push("School Input too Long");
        } else if (alphanumericPunctuationRegex(data[key])) {
          errors.push("School is not Alphanumeric");
        }
        break;
      }
      case "collegeAffiliation": {
        const validOptions = [
          "i am not a ucsc student",
          "i am a UCSC grad student with no college affiliation",
          "college 9",
          "college 10",
          "cowell",
          "stevenson",
          "crown",
          "merrill",
          "kresge",
          "porter",
          "rachel carson college",
          "oakes",
        ];
        if (data[key] === undefined || !validOptions.includes(data[key].toLowerCase())) {
          errors.push("Invalid College Affiliation");
        }
        break;
      }
      case "eventLocation": {
        const validOptions = ["on-campus at uc santa cruz", "santa cruz county", "other", "unsure"];
        if (data[key] === undefined || !validOptions.includes(data[key].toLowerCase())) {
          errors.push("Not a valid event location");
        }
        break;
      }
      case "major": {
        if (data[key] === "") {
          errors.push("No major inputted");
        } else if (data[key].length > 50) {
          errors.push("Major Name Too Long");
        } else if (data[key] && alphanumericPunctuationRegex(data[key])) {
          errors.push("Major name is not alphanumeric");
        }
        break;
      }
      case "currentStanding": {
        if (data[key] === "") {
          errors.push("No standing inputted");
        } else if (data[key].length > 50) {
          errors.push("Standing Name Too Long");
        } else if (data[key] && alphanumericPunctuationRegex(data[key])) {
          errors.push("Standing name is not alphanumeric");
        }
        break;
      }
      case "country": {
        if (data[key] === "") {
          errors.push("No country inputted");
        } else if (data[key].length > 50) {
          errors.push("Country Name Too Long");
        } else if (data[key] && alphanumericPunctuationRegex(data[key])) {
          errors.push("Country name is not alphanumeric");
        }
        break;
      }
      case "whyCruzHacks": {
        if (data[key] === "") {
          errors.push("No response for Why CruzHacks");
        } else if (data[key].length > 250) {
          errors.push("Why Cruzhacks response too Long");
        } else if (data[key] && alphanumericPunctuationRegexWithNewLine(data[key])) {
          errors.push("Why CruzHacks is not alphanumeric with punctuation");
        }
        break;
      }
      case "newThisYear": {
        if (data[key] === "") {
          errors.push("No response for New This Year");
        } else if (data[key].length > 250) {
          errors.push("New This Year response too Long");
        } else if (data[key] && alphanumericPunctuationRegexWithNewLine(data[key])) {
          errors.push("New This Year is not alphanumeric with punctuation");
        }
        break;
      }
      case "grandestInvention": {
        if (data[key] === "") {
          errors.push("No response for Grandest Invention");
        } else if (data[key].length > 250) {
          errors.push("Grandest Invention response too Long");
        } else if (data[key] && alphanumericPunctuationRegexWithNewLine(data[key])) {
          errors.push("Grandest Invention is not alphanumeric with punctuation");
        }
        break;
      }
      case "hackathonCount": {
        if (data[key] < 0) {
          errors.push("Invalid Hackathon Count");
        } else if (data[key] > 100) {
          errors.push("Too many hackathons attended");
        }
        break;
      }
      case "priorExperience": {
        if (data[key].length > 100) {
          errors.push("Prior Experience response too Long");
        } else if (data[key] && alphanumericPunctuationRegexWithNewLine(data[key])) {
          errors.push("Prior Experience is not alphanumeric with punctuation");
        }
        break;
      }
      case "linkedin": {
        if (data[key].length > 100) {
          errors.push("LinkedIn Id too Long");
        } else if (data[key] && alphanumericPunctuationRegex(data[key])) {
          errors.push("LinkedIn is not alphanumeric with punctuation");
        }
        break;
      }
      case "github": {
        if (data[key].length > 100) {
          errors.push("GitHub Id too Long");
        } else if (data[key] && alphanumericPunctuationRegex(data[key])) {
          errors.push("GitHub Id is not alphanumeric with punctuation");
        }
        break;
      }
      case "cruzCoins": {
        if (data[key].length > 100) {
          errors.push("CruzCoins response too Long");
        } else if (data[key] && alphanumericPunctuationRegexWithNewLine(data[key])) {
          errors.push("CruzCoins is not alphanumeric with punctuation");
        }
        break;
      }
      case "anythingElse": {
        if (data[key].length > 100) {
          errors.push("Anything Else response too Long");
        } else if (data[key] && alphanumericPunctuationRegexWithNewLine(data[key])) {
          errors.push("Anything Else is not alphanumeric with punctuation");
        }
        break;
      }
      default:
        break;
    }
  });
  return errors;
};

const validateResume = (files) => {
  let errors = [];
  if (files && files.file) {
    const maxSize = 1000000;
    const resume = files.file;
    const fileExtensions = {
      pdf: "application/pdf",
    };

    if (resume) {
      const filename = resume.name;
      const extension = filename.split(".").pop();
      if (!fileExtensions[extension]) {
        errors.push("Not a Valid File extension");
      }
      if (fileExtensions[extension] && fileExtensions[extension] !== resume.type) {
        errors.push("File Extension and Type does not match");
      }
      if (resume.size > maxSize) {
        errors.push("Document is greater than 1mb");
      }
    }
  }
  return errors;
};

const isValidFileData = (filedata) => {
  return filedata && filedata.length > 0 && filedata[filedata.length - 1] && filedata[filedata.length - 1]["mediaLink"];
};

const getNewFileName = (data, filename, user) => {
  // const lname = data.lname.replace(/[^0-9a-z]/gi, "").toLowerCase();
  // const fname = data.fname.replace(/[^0-9a-z]/gi, "").toLowerCase();
  const uid = user.split("|").slice(1).join("");
  // const file = lname + "_" + fname + "_" + uid;
  var extension = filename.split(".").pop();
  if (extension === "") {
    extension = "pdf";
  }
  return uid + "." + extension;
};

module.exports = { createAppObject, validateAppData, validateResume, isValidFileData, getNewFileName };
