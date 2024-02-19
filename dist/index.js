"use strict";

var express = require("express");
var app = express();
app.get('/api/hello-user', function (req, res) {
  var user = req.query.user;
  res.json('Howdy ' + user + ', First Milestone!');
});
var port = process.env.PORT || 5000;
app.listen(port, function () {
  console.log("Server is running on port ".concat(port));
});