////////////////////////////////////////////////////////////////////////////////
var path = require('path');
var fs   = require('fs');
var async = require('async');

var _ = require('lodash');

var express = require('express');
// var jisonParser = require("jison").Parser;
var marked = require('marked');
var pmarkdown = require('../experiment/parametric');
////////////////////////////////////////////////////////////////////////////////
var api = express.Router({strict: true});

function parseParamMD(markdown) {
  var pageParsed  = pmarkdown.parse(markdown);
  pageParsed.text = marked(pageParsed.text);
  return pageParsed;
};

function pagePath(pagename) {
  return __dirname + "/../materials/content/"+pagename+".md";
}
function miscPath(pagename) {
  return __dirname + "/../materials/misc/"+pagename+".md";
}

api.get('/pages', function(req, res, next) {
  var pagenames = [];

  fs.readdir(__dirname+'/../materials/content/', function(err, files) {
    if (err) {
      res.status(500).json({error: "Something went wrong"}); return;
    }
    var pagenames = _.filter(files, function(file) {
      return file.match(/\.md$/) != null;
    });

    if(req.query.description == '1') {
      var detailedPages = [];

      async.eachSeries(
        pagenames,
        function(filename, cb) {
          console.log(filename);
          var cleanname = filename.match(/(.*?)(\.md)$/)[1];
          console.log(cleanname);
          fs.readFile(pagePath(cleanname), function(err, data) {
            if (err) {
              res.status(500).json({error: "No such page"+miscPath(cleanname)}); return;
            }
            var params = parseParamMD(data.toString()).params;
            detailedPages.push({
              name:   cleanname,
              description: params.description ? params.description : "blank",
              background: params.background
            });
            cb();
          });
        },
        function(err) {
          console.log("done");
          res.json(detailedPages);
        }
      );

    } else {
      res.json(_.map(pagenames, function(file) {
        return file.match(/(.*?)(\.md)$/)[1];
      }));
    }
  });

});

api.get('/page/:pagename', function(req, res, next) {
  var pagename = req.params.pagename;
  
  if (!pagename) {
    res.status(500).json({error: "No pagename provided"}); return;
  }

  fs.readFile(pagePath(pagename), function(err, data) {
    if (err) {
      res.status(500).json({error: "No such page"+pagePath(pagename)}); return;
    }
    res.json(parseParamMD(data.toString()));
  });
});

api.get('/misc/:pagename', function(req, res, next) {
  var pagename = req.params.pagename;
  
  if (!pagename) {
    res.status(500).json({error: "No pagename provided"}); return;
  }

  fs.readFile(miscPath(pagename), function(err, data) {
    if (err) {
      res.status(500).json({error: "No such page"+miscPath(pagename)}); return;
    }
    res.json(parseParamMD(data.toString()));
  });
});


api.get('/test', function(req, res, next) {
  var filename = __dirname + "/content/about.md";
  fs.readFile(filename, 'utf8', function(err, data) {
    if(err) {
      next(new Error("Can not open file..."));
    } else {
      res.send(parseParamMD(data));
    }
  });
});

// Test api to make sure everything works fine
api.use('/', function(req, res, next) {
  res.json({success: true, message: "The server is working fine"});
  console.log(req.headers);
  console.log(req.body);
});

module.exports = api
