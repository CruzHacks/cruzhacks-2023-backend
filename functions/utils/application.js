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
    //console.log(resume)
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

const getNewFileName = (data, filename) => {
  const extension = filename.split(".").pop();
  return "example" + "." + extension;
};

module.exports = { createAppObject, validateAppData, validateResume, isValidFileData, getNewFileName };
