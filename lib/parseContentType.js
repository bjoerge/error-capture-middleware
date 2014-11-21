module.exports = function parseContentType(headerValue) {
  if (!headerValue) {
    return headerValue;
  }
  return headerValue.split(";")[0];
};