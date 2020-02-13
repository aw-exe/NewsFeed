// Require installed packages
var express = require("express");
var exphbs  = require('express-handlebars');
var path = require ('path');
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
var cheerio = require("cheerio");
var axios = require("axios");

// Require all models
var db = require("./models");

//Initialize Port
var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

//Initialize Express-Handlebars
app.engine('handlebars', exphbs({
  defaultLayout: "main",
  partialsDir: path.join(__dirname, "views/layout/partials")
}));
app.set('view engine', 'handlebars');
 

// Configure Morgan Middleware - use for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connecting to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newsfeed";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true});











// Routes

////////// Used this chunk of code below to see if my scrape worked in my terminal before making routes for my app //////////

// axios.get("https://www.spin.com/news/").then(function(response) {
//   // Load the HTML into cheerio and save it to a variable
//   // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
//   var $ = cheerio.load(response.data);
//   console.log(response.data);
//   // An empty array to save the data that we'll scrape
//   var results = [];
//   // Select each element in the HTML body from which you want information.
//   // NOTE: Cheerio selectors function similarly to jQuery's selectors,
//   // but be sure to visit the package's npm page to see how it works
//   $("div.preview-holder").each(function(i, element) {
//     console.log(element)
//     //Used let and trim to take off line breaks at the beginning of the each field result
//     let title = $(element).children("a").children("h3").text().trim();
//     let blurb = $(element).children("div.preview").text().trim();
//     const link = $(element).children("a").attr("href");
//     // Save these results in an object that we'll push into the results array we defined earlier
//     results.push({
//       title: title,
//       blurb: blurb,
//       link: link
//     });
//   });
//   // Log the results once you've looped through each of the elements found with cheerio
//   console.log(results);
// });


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// GET route for scraping SPIN's website
app.get("/scrape", function(req, res) {
  axios.get("https://www.spin.com/news/").then(function(response) {
    let $ = cheerio.load(response.data);
    console.log(response.data);

    // Grabbing each article with a preview-holder tag
    $("div.preview-holder").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href and save them as properties of the result object
      result.title = $(element).children("a").children("h3").text().trim();
      result.blurb = $(element).children("div.preview").text().trim();
      result.link = $(element).children("a").attr("href");

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
