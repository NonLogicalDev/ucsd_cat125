var Parametric = require('./parametric');
var fs = require('fs');

fs.readFile('parametric.md', function(err, data) {
  console.log('===============================');
  console.log(data.toString());
  console.log('===============================');
  var result = Parametric.parse(data.toString());
  console.log('PARAMS: =======================');
  console.log(result.params);
  console.log('DATA:   =======================');
  console.log(result.text);
});

