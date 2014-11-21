# error-capture-middleware

An express/connect dev middleware that magically makes any errors that occurred while serving css/js appear on page

## Usage

```js
if (process.env.NODE_ENV === 'development') {
  var capture = require("error-capture-middleware");
  app.use("/browser", capture.js());
  app.use("/stylesheets", capture.css());
}
```

