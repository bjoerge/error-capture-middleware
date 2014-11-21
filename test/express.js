var test = require('tap').test;
var request = require('supertest');
var express = require('express');
var assert = require('assert');
var vm = require('vm');

var capture = require("../");

function createApp() {
  var app = express();
  app.get('/nonfailing.js', function(req, res){
    res.type("application/javascript")
      .status(200)
      .send("console.log('ok')");
  });

  app.get('/nonfailing.css', function(req, res){
    res.type("text/css")
      .status(200)
      .send("body { background-color: blue; }");
  });

  app.get('/fail.js', function(req, res, next) {
    res.type("application/javascript");
    next(new Error("JS error"));
  });

  app.get('/fail.css', function(req, res, next) {
    res.type("text/css");
    next(new Error("CSS error"));
  });

  return app;
}

describe('non-failing requests', function() {
  it('handles js as normal', function(done) {

    var app = createApp();
    app.use(capture.js());
    app.use(capture.css());

    request(app)
      .get('/nonfailing.js')
      .expect(200)
      .end(done);
  });
  it('handles css as normal', function(done) {

    var app = createApp();
    app.use(capture.js());
    app.use(capture.css());

    request(app)
      .get('/nonfailing.css')
      .expect(200)
      .end(done);
  });
});

describe('failing js requests', function() {
  it('is returning a throw statement', function(done) {
    var app = createApp();

    app.use(capture.js({
      throws: true,  // on by default
      body: true  // off by default
    }));

    request(app)
      .get('/fail.js')
      .expect(200)
      .expect(function(response) {
        var err = response.text;

        var wasCalled = false;

        var mockDoc = {
          document: {
            createElement: function() {
              return { innerHTML: '' }
            },
            body: {
              appendChild: function() {
                wasCalled = true;
              }
            }
          }
        };
        
        try {
          vm.runInNewContext(err, mockDoc);
        } catch(e) {
          assert.equal(e.message, "JS error");
          assert.equal(e.stack.split("\n")[0], "Error: JS error")
        }
        assert(wasCalled, "Expected document.appendChild to be called");
      })
      .end(done);
  });

});

describe('failing css requests', function() {
  it('is returning a body::after selector with error as content', function(done) {
    var app = createApp();
    app.use(capture.css());
    request(app)
      .get('/fail.css')
      .expect(200)
      .expect(/body::before {/)
      .expect(/Got error while handling GET/)
      .expect(/Error: CSS error/)
      .end(done);
  });

});
