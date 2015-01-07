// Requires: /////////////////////////////////////////////////////////////////// 
var http = require('http');
//////////////////////////////////////////////////////////////////////////////// 

// Setting up the port to listen on
var PORT = process.env.PORT || 3000;

// Creating the server
http.createServer(
  require('./server')(__dirname + '/.build/', 'views/main.html')
).listen(PORT, '0.0.0.0');

console.log("Server started at: http://0.0.0.0:" + PORT);
