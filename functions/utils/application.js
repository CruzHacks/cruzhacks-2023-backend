const {alphanumericRegex, alphanumericPunctuationRegex, phoneRegex} = require("./regex")

const createAppObject = (body, isPending) => {
  const pronouns = []
  const sexuality = []
  const isUCSC = body["school"] ? (body["school"].toLowerCase() === "ucsc" || body["school"].toLowerCase() === "uc santa cruz" || body["school"].toLowerCase() === "university of california, santa cruz") : false;
  // if (body["ptnaPronouns"]) {
  //   pronouns.push("Prefer Not to Answer")
  // }
  // else if (body["otherPronouns"] !== "") {
  //   pronouns.push(body["otherPronouns"])
  // }
  // else {
  //   if (body["heHimHis"]) {
  //     pronouns.push("He/Him/His")
  //   }
  //   if (body["sheHerHers"]) {
  //     pronouns.push("She/Her/Hers")
  //   }
  //   if (body["theyThemTheir"]){
  //     pronouns.push("They/Them/Their")
  //   }
  // }

  
  // if (body["ptna"]) {
  //   pronouns.push("Prefer Not to Answer")
  // }
  // else if (body["otherPronouns"] !== "") {
  //   pronouns.push(body["otherPronouns"])
  // }
  // else {
  //   if (body["heHimHis"]) {
  //     pronouns.push("He/Him/His")
  //   }
  //   if (body["sheHerHers"]) {
  //     pronouns.push("She/Her/Hers")
  //   }
  //   if (body["theyThemTheir"]){
  //     pronouns.push("They/Them/Their")
  //   }
  // }

  const appObj = {
    // App Info
    status: isPending ? "pending" : "No Document",
    // Contact Info
    email: body["email"],
    fname: body["fname"] ? body["fname"] : "",
    lname: body["lname"] ? body["lname"] : "",
    phone: body["phone"] ? body["phone"] : "",

    // Demographic
    age: body["age"] ? Integer.parseInt(body["age"]) : -1,
    pronouns: pronouns,
    sexuality: sexuality,
    race: body["race"] ? body["race"] : "",
    ucscStudent: isUCSC,
    school: body["school"] ? body[school].toLowerCase() : "",
    collegeAffiliation: body["collegeAffiliation"] ? body["collegeAffiliation"] : "", //Fix to to deal with ucsc
    eventLocation: body["eventLocation"] ? body["eventLocation"] : "",
    major: body["major"] ? body["major"] : "",
    currentStanding: body["currentStanding"] ? body["currentStanding"] : "",
    country: body["country"] ? body["country"] : "",


    // Short Answer
    whyCruzHacks: body["whyCruzHacks"] ? body["whyCruzHacks"] : "",
    newThisYear: body["newThisYear"] ? body["newThisYear"] : "",
    grandestInvention: body["grandestInvention"] ? body["grandInvention"] : "",

    // Prior Experience
    firstCruzHack: body["firstCruzHack"] === true,
    hackathonCount: body["hackathonCount"] ? Integer.parseInt(body["hackathonCount"]) : -1,
    priorExperience: body["priorExperience"] ? body["priorExperience"] : "",

    // Connected
    linkedin: body["linkedin"] ? body["linkedin"] : "",
    github: body["github"] ? body["github"] : "",
    cruzCoins: body["cruzCoins"] ? body["cruzCoins"] : "",
    anythingElse: body["anythingElse"] ? body["anythingElse"]: ""

  };
  return appObj;
};

const validateAppData = (data, isPending) => {
  const fields = ["email", "fname", "lname", "phone", "age", "pronouns", "race", "sexuality", "ucscStudent", "school", "collegeAffiliation", "eventLocation", 
"major", "currentStanding", "country", "whyCruzHacks", "newThisYear", "grandestInvention", "firstCruzHack", "hackathonCount", "priorExperience",
"linkedin", "github", "cruzCoins", "anythingElse" ];
  let errors = [];

  fields.forEach((key) => {
    switch (key) {
      case "email":
        console.log("Test")
        if (data[key] === "" || data[key].length > 100) {
          errors.push("Email is Invalid");
        }
        break;
      case "fname":
        if (data[key] === "" ) {
          errors.push("First Name is Empty")
        }
        else if(data[key].length > 25) {
          errors.push("First Name is Too Long")
        }
        else if (alphanumericPunctuationRegex(data[key])) {
          errors.push("First Name Invalid Alphanumeric")
        }
        break;
      case "lname":
        if (data[key] === "" ) {
          errors.push("Last Name is Empty")
        }
        else if(data[key].length > 25) {
          errors.push("Last Name is Too Long")
        }
        else if (alphanumericPunctuationRegex(data[key])) {
          errors.push("Last Name Invalid Alphanumeric")
        }
        break;
      
      case "phone":
        if (data[key] === "" ) {
          errors.push("Phone Number is Empty")
        }
        else if(data[key].length > 12) {
          errors.push("Phone Number is Too Long")
        }
        else if (phoneRegex(data[key])) {
          errors.push("Phone Number Invalid")
        }
        break;
      
      case "age":
        if (data[key] < 5) {
          errors.push("Age is Too Low")
        }
        else if(data[key] > 99) {
          errors.push("Age is Too High")
        }
        break;
      
      // Need to validate Pronouns, sexuality more in-depth
      case "pronouns":
        if (data[key].length() === 0) {
          errors.push("No Pronouns Selected")
        }
        if (data[key.length] >= 5) {
          errors.push("Too Big of an Array")
        }
        break;
      
      case "sexuality":
        if (data[key].length() === 0) {
          errors.push("No Sexuality Selected")
        }
        if (data[key.length] >= 5) {
          errors.push("Too Big of an Array")
        }
        break;

      case "race":
        if (data[key].length() === 0) {
          errors.push("No Race Inputted")
        }
        else if (data[key].length() > 50) {
          errors.push("Race String Too Long")
        }
        else if (alphanumericRegex(data[key])){
          errors.push("Race is not alphanumeric")
        }
        break;
      
      case "school":
        if (data[key].length === 0) {
          errors.push("No School Inputted")
        }
        else if (data[key].length > 100) {
          errors.push("School is Missing")
        }
        break;
      
      case "collegeAffiliation":
        const validOptions = [""]
        if (data["ucscStudent"] && !validOptions.includes(data[key])) {
          errors.push("Invalid College Affiliation")
        }
        break;
            
      case "eventLocation":
        break;
      
      case "major":
        break;
      
      case "currentStanding":
        break;
      
      case "country":
        break;
        
      case "whyCruzHacks":
        break;
      
      case "newThisYear":
        break;
      
      case "grandestInvention":
        break;
      
      case "firstCruzHack":
        break;
      
      case "hackathonCount":
        break;
      
      case "priorExperience":
        break;
      
      case "linkedin":
        break;
      
      case "github":
        break;
      
      case "cruzCoins":
        break;
      
      case "anythingElse":
        break;

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
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      doc: "application/msword",
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
  // const lname = data.lname.replace(/[^0-9a-z]/gi, '').toLowerCase();
  // const fname = data.fname.replace(/[^0-9a-z]/gi, '').toLowerCase();
  const uid = user.split('|').slice(1).join('')
  //const file = lname + "_" + fname + "_" + uid
  var extension = filename.split(".").pop();
  if (extension == "") {
    extension = "pdf"
  }
  return uid + "." + extension;
};

module.exports = { createAppObject, validateAppData, validateResume, isValidFileData, getNewFileName };
