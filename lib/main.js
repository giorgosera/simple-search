var express = require('express');
var app = express();

var server = app.listen(3000, function() {
    console.log('Simple search server listening on port %d', server.address().port);
});