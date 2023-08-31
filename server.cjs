var express = require('express');
var app = express();
var path = require('path');
 
// view at http://localhost:80/
// serve static content from "./dist/index.html"
app.use(express.static(path.join(__dirname, './dist')));
 
app.listen(80);
console.log('Server running at http://localhost:80/');
