const express = require("express");
const Exphbs = require("express-handlebars");
var logger = require("morgan");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

const app = express();
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

const PORT = process.env.PORT || 8080;

var db = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Connect mongoose to our database
mongoose.connect(db, function(error) {
  // Log any errors connecting with mongoose
  if (error) {
    console.log(error);
  }
  // Or log a success message
  else {
    console.log("mongoose connection is successful");
  }
});

app.use(express.static("public"));
app.engine("handlebars", Exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

require("./controllers/scraper-controller")(app);

app.listen(PORT, function() {
    console.log("App running on http://localhost:" + PORT);
});