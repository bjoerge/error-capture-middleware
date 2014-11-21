var parseContentType = require("./lib/parseContentType");

function makeThrowStatement(err) {
  var str = "";
  str += "/*\n";
  str += err.stack;
  str += "\n*/\n";
  str += "var e = new Error(" + JSON.stringify(err.message) + ");";
  if (err.stack) {
    str += "\ne.stack=" + JSON.stringify(err.stack) + ";";
  }
  str += "\nthrow e;";
  return str;
}

function appendToBody(innerHTML) {
  var str = "";
  str += "var el = document.createElement('div');\n";
  str += "el.style='';\n";
  str += 'el.innerHTML='+JSON.stringify(innerHTML)+";\n";
  str += 'document.body.appendChild(el);\n';
  return str;
}


function formatHTML(error) {
  return error.message;
}
// A simple express middleware that handles request errors by wrapping them in a throw statement for the browser
module.exports = function (options) {
  options = options || {};
  
  return function captureJsErrors(err, req, res, next) {
    if (!err) {
      return next();
    }
    if (parseContentType(res.get('Content-Type')) !== 'application/javascript') {
      return next(err);
    }
    
    var response = "";

    if (options.body) {
      response += appendToBody(formatHTML(err));
    }

    if (options.throws !== false) {
      response += makeThrowStatement(err);
    }

    res
      .status(200)
      .end(response);
  };
};
  