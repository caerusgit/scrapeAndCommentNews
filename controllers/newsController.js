var express = require("express");

var router = express.Router();


var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./../models");


// Configure middleware

// Use morgan logger for logging requests
// app.use(logger("dev"));



// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scrapeAndCommentNews";

mongoose.connect(MONGODB_URI);


// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/scrapeAndCommentNews", { useNewUrlParser: true });

// Routes






// A GET route for scraping the echoJS website
router.get("/", function (req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.eluniversal.com.mx").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    $(".multimedia").each(function (i, element) {
      // Save the text and href of each link enclosed in the current element
      var title = $(element).children(".views-field-views-conditional-2").children(".field-content").children("a").text();
      var link = $(element).children(".views-field-views-conditional-2").children(".field-content").children("a").attr("href");
      var summary = $(element).children(".views-field-field-resumen").children(".field-content").text();



      // If this found element had both a title and a link
      if (title && link && summary) {
        // Save an empty result object
        var result = {};
        // Add the text and href of every link, and save them as properties of the result object
        result.title = title
        result.link = link
        result.summary = summary

        // Create a new Article using the `result` object built from scraping
        db.Article.create(result)
          .then(function (dbArticle) {
            // View the added result in the console
            console.log(dbArticle);
          })
          .catch(function (err) {
            // If an error occurred, log it
            console.log(err);
          });
      }
    });
    db.Article.find({})
    .then(function (dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      // res.json(dbArticle);
      var hbsObject = {
        news: dbArticle
      };
      // console.log("dbArticle-------------------------", dbArticle)
      res.render("index", hbsObject)
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
    // Send a message to the client
    // res.send("Scrape Complete");
  });
});



// Route for getting all Articles from the db
router.get("/articles", function (req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function (dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
router.get("/articles/:id", function (req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function (dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
router.post("/articles/:id", function (req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function (dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function (dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// Export routes for server.js to use.
module.exports = router;