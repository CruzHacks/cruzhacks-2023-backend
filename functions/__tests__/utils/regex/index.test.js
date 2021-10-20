const { phoneRegex, alphanumericPunctuationRegex } = require("../../../utils/regex");

describe("Testing AlphanumericRegex", () => {
  it("Should Pass given the Alphabet", () => {
    expect(alphanumericPunctuationRegex("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUZWXYZ")).toBe(false);
  });
  it("Should Pass given Numeric Characters", () => {
    expect(alphanumericPunctuationRegex("1234567890")).toBe(false);
  });
  it("Should Pass given a mix of Numeric and Alphabet Characters", () => {
    expect(alphanumericPunctuationRegex("abc123")).toBe(false);
  });
  it("Should Pass given Spaces", () => {
    expect(alphanumericPunctuationRegex("a 1 b 2")).toBe(false);
  });
  it("Should Pass given Common Punctuation", () => {
    expect(alphanumericPunctuationRegex("+-(){}.,/\\_@#$%^&*:;\"'")).toBe(false);
  });
  it("Should Fail Given an Emoji", () => {
    expect(alphanumericPunctuationRegex("🔥")).toBe(true);
  });
  it("Should Fail Given Binary Data", () => {
    expect(
      alphanumericPunctuationRegex(
        "Æ2ÄLbã¼ð♦▬;Ü▼.‰∟ôˆ⌂o♀xi„¸ŸœéÂ¿È»►¿¥õ8ŸVÎ(¸ç3¹OÄ_#D…2↑↑↔Û♣é@ 4D'ÅP9’V.§‡V♫€˜r9*¹È¤¦♠~qc♫­…Q▬5µ◄‚‰,Ž¾Ó*®",
      ),
    ).toBe(true);
  });
});

describe("Testing Phone Regex", () => {
  it("Should Pass given Standard Phone Format", () => {
    expect(phoneRegex("123-456-7890")).toBe(false);
  });
  it("Should Pass given Parantheses", () => {
    expect(phoneRegex("(123) 456-7890")).toBe(false);
  });
  it("Should Pass given periods as dividers", () => {
    expect(phoneRegex("123.456.7890")).toBe(false);
  });
  it("Should Pass given spaces as dividers", () => {
    expect(phoneRegex("123 456 7890")).toBe(false);
  });
  it("Should Pass given International Format", () => {
    expect(phoneRegex("+1 123.456.7890")).toBe(false);
  });
  it("Should Fail given a string is empty", () => {
    expect(phoneRegex("")).toBe(true);
  });
  it("Should Fail given that alphabet characters exists", () => {
    expect(phoneRegex("abcdefghi")).toBe(true);
  });
  it("Should Fail given that invalid Phone format", () => {
    expect(phoneRegex("123-456-7890-1023")).toBe(true);
  });
});
