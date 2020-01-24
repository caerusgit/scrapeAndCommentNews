var express = require("express");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Make public a static folder
app.use(express.static("public"));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Import routes and give the server access to them.
var routes = require("./controllers/newsController.js");

app.use(routes);

// var logger = require("morgan");

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
