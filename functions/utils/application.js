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
    if (resume && (!fileTypes.includes(resume.type) || resume.size > maxSize)) {
      errors.push("Error");
    }
  }
  return errors;
};

module.exports = { createAppObject, validateAppData, validateResume };
