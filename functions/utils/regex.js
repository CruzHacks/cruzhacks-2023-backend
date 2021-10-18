const phoneRegex = (number) => {
  return !/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/.test(number);
};

const linkedInRegex = (message) => {
  return !"^https?://((www|ww).)?linkedin.com/((in/[^/]+/?)|(pub/[^/]+/((w|d)+/?){3}))$".test(message);
};

const alphanumericRegex = (message) => {
  return !/^[a-zA-Z0-9 ]+$/.test(message);
};

const alphanumericPunctuationRegex = (message) => {
  return !/[^a-zA-Z0-9\s\p{P}]/.test(message);
};

module.exports = { phoneRegex, linkedInRegex, alphanumericPunctuationRegex, alphanumericRegex };
