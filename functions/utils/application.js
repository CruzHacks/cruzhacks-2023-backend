const createAppObject = (body) => {
  const appObj = {
    title: body["title"],
    email: body["email"],
  };
  return appObj;
};

const validateAppData = (data) => {
  const fields = [];
  let errors = [];

  fields.forEach((key) => {
    switch (key) {
      case "email":
        if (data[key] === "") {
          errors.push("Email is Invalid");
        }
        /*
                validate anything necessary for data[key]
                errors.push("Error")
            */
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
    fileTypes = ["application/pdf", "application/docx"];
    if (resume) {
        if (!fileTypes.includes(resume.type)) {
            errors.push("Document Type is not valid")
        }
        if (resume.size > maxSize) {
            errors.push("Document is greater than 1mb")
        }
        // TODO:
        // Validate file name for correct extension
    }
  }
  return errors;
};

module.exports = { createAppObject, validateAppData, validateResume };
