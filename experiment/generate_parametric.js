var Generator = require("jison").Generator;
var fs     = require("fs");

var parametric = new Generator(
  require('./parametric.json')
);

var parserSource = parametric.generate({
  type: "slr",
  moduleType: "commonjs",
  moduleName: "ParametricMD"
});

fs.writeFile('parametric.js', parserSource, function(err) {
  if (err) {
    console.log(err);
  }
});
