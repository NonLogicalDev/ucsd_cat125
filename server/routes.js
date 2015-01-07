////////////////////////////////////////////////////////////////////////////////
var express = require('express');
var api     = require('./api');
////////////////////////////////////////////////////////////////////////////////
module.exports = function(static_path) {
  var router = express.Router({strict: true});

  // Use the api routes
  router.use('/api', function(req, res, next) {
    // If the file is not found render an error
    api(req, res, function() {
      var err = new Error();
      err.status = 404;
      err.message = "No such api";
      next(err);
    });
  });

  router.use('/s', express.static(__dirname + '/../materials'));
  // Setting up the static file locations
  router.use('/s', function(req, res, next) {
    // If the file is not found render an error
    express.static(static_path)(req, res, function() {
      var err = new Error();
      err.status = 404;
      err.message = "Requested static file cannot be found."
      next(err);
    });
  });

  // Error Handling:
  router.use(function(err, req, res, next) {
    console.log(err.status + " Error:" + err.message);
    var default_err = {
      status: 500,
      message:  "Uh! Oh! Something went wrong!\n" +
                "Our team of trained monkeys has been dispatched to examine the issue"
    }

    res
    .status(err.status || default_err.status)
    .send(err.message || default_err.message);
  });

  return router;
};
