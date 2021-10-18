const phoneRegex = (number) => {
    return !(/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/.test(message))
}

const linkedInRegex = (message) => {
    return !("^https?://((www|\w\w)\.)?linkedin.com/((in/[^/]+/?)|(pub/[^/]+/((\w|\d)+/?){3}))$".test(message))
}

const alphanumericRegex = (message) => {
    return !(/^[a-zA-Z0-9 ]+$/.test(message))
}

const alphanumericPunctuationRegex = (message) => {
    return  !(/^[A-Za-z0-9 _.,!\"'/$]*/.test(message))
}


module.exports = { phoneRegex, linkedInRegex, alphanumericPunctuationRegex, alphanumericRegex }
