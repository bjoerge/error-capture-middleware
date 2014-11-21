var parseContentType = require("./lib/parseContentType");

function makeErrorSelector(req, err) {
  var stack = (err.stack ? err.stack : err.message || err);
  var message = "Got error while handling GET " + JSON.stringify(req.originalUrl) + ":\n " + stack;
  var str = "";
  str += "body::before {";
  str += "display:          block;";
  str += "content:          " + JSON.stringify(message).replace(/\\n/g, "\\a") + ";";
  str += "border:           1px solid #c51d23;";
  str += "background-color: #fefefe;";
  str += "padding:          10px;";
  str += "white-space:      pre;";
  return str;
}

// A connect middleware that magically makes any errors that occurred while serving css appear on page  
module.exports = function () {
  return function captureCssErrors(err, req, res, next) {
    if (!err) {
      return next();
    }
    if (parseContentType(res.get('Content-Type')) !== 'text/css') {
      return next(err);
    }
    res
      .status(200)
      .end(makeErrorSelector(req, err));
  };
};
