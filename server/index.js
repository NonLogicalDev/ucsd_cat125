// Requires: ///////////////////////////////////////////////////////////////////
var path       = require('path');

var express    = require('express');
var bodyParser = require('body-parser');
var multer     = require('multer');
var morgan     = require('morgan');

var routes     = require('./routes')
////////////////////////////////////////////////////////////////////////////////

exports = module.exports = function(static_path, entry_point) {
  console.log("Static content at: [" + static_path + "]");

  // Create an instance of an express app
  var app = express();

  app.use(morgan('dev'));

  // Parsing the body of the request
  app.use(bodyParser.raw());
  app.use(bodyParser.text());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded());
  app.use(multer());

  // Setting up routes
  app.use(routes(static_path));

  // Otherwise default to the index.html
  app.get('*', function(req, res) {
    res.sendFile(static_path + "/" + entry_point);
  });

  // Exporting app to give it off to http server
  return app;
}
