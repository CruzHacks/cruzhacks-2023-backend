const phoneRegex = (number) => {
  return !/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/.test(number);
};

const alphanumericRegex = (message) => {
  return !/^[a-zA-Z0-9 ]+$/.test(message);
};

const alphanumericPunctuationRegex = (message) => {
  return !/^[\x20-\x7E]*$/.test(message);
};

const alphanumericPunctuationRegexWithNewLine = (message) => {
  return !/^[\x20-\x7E\r?\n]*$/.test(message);
};

const emailRegex = (email) => {
  return !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email);
};

const cruzPointsActivityTypeRegex = (activityType) => {
  return activityType.match(/HackathonWorkshops|Game/);
};

module.exports = {
  phoneRegex,
  alphanumericPunctuationRegex,
  alphanumericRegex,
  alphanumericPunctuationRegexWithNewLine,
  cruzPointsActivityTypeRegex,
  emailRegex,
};
