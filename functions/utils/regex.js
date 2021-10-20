const phoneRegex = (number) => {
  return !/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/.test(number);
};

const alphanumericRegex = (message) => {
  return !/^[a-zA-Z0-9 ]+$/.test(message);
};

const alphanumericPunctuationRegex = (message) => {
  return !/^[ A-Za-z0-9_@.,/(){}*:$%;"'^/\\#&+-]*$/.test(message);
};

module.exports = { phoneRegex, alphanumericPunctuationRegex, alphanumericRegex };
