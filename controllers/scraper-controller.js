const request = require("request");
const cheerio = require("cheerio");
var mongoose = require("mongoose");

var Note = require("../models/Note.js");
var Article = require("../models/Article.js");

module.exports = function(app) {

    // Route displays landing page
    app.get("/", function(req, res) {
        res.render("index");
    });

    // route displays saved articles page
    app.get("/saved", function(req, res) {
        res.render("saved");
    });

    // get route to return all articles in the database
    app.get("/all", function(req, res) {

        Article.find({}, function(error, data) {

            if (error) {
                console.log(error);
            }
            else {
                res.json(data);
            }
        });
    });

    // scrape route - hit NYT business page
    app.get("/scrape", function(req, res) {

        // array to store articles for inserting into database
        var articleArray = [];

        request("https://www.nytimes.com/section/business", function(error, response, html) {

            let $ = cheerio.load(html);
            
            // for every headline on the page
            $("h2.headline").each(function(index, element) {

                let link = $(element).find("a").attr("href");
                let title = $(element).find("a").text();
                let summary = $(element).closest(".story-body").find(".summary").text();
                let byline = $(element).closest(".story-body").find(".author").text();
        
                //if the headline has a link, push it onto the array for storage
                if(link) {
                    articleArray.push({title: title, link: link, summary: summary, byline: byline});
                }
            });
            res.send(articleArray);
        });
    });

    // get route to return all saved articles
    app.get("/saved/all", function(req, res) {

        Article.find({}, function(error, data) {

            console.log(data);

            if (error) {
                console.log(error);
            }
            else {
                res.json(data);
            }
        });
    });

    // post route receives an article to save
    app.post("/save", function(req, res) {

        // check to see if the article is already saved
        Article.findOne({ title: req.body.title }, function(error, result) {

            // if not already saved, add it to the db
            if(!result) {

                let newArticle = Article(req.body);

                newArticle.save(req.body, function(error, data) {
                    res.json(data);
                });
            }

            else {
                res.json(null);
            }
        });

    });

    // delete route to remove an article from the database
    app.post("/delete", function(req, res) {

        Article.findOneAndRemove({ title: req.body.title }, function(error, data) {
        if(error) {
            console.log(error);
        }
        else {
            res.json(data);
        }
        });
    });

    // post route to delete a note from the db
    app.post("/note/delete/:id", function(req, res) {

        console.log(req.params.id);
        console.log(req.body);

        Note.findOneAndRemove({ _id: req.params.id }, function(error, data) {

            if(error) {
                console.log(error);
            }
            else {
                // then find the associate article from the req.params.id
                console.log(req.body.articleID);
                console.log(req.params.id);
                Article.update({ _id: req.body.articleID }, { $pull: {"notes": req.params.id }}).exec(function(error, data) {
                    console.log("am I here?");
                    res.json(data);
                });
            }
        });
    });

    app.get("/notes/:id", function(req, res) {

        Article.find({ _id: req.params.id })
        .populate("notes")
        .exec(function(error, data) {

            console.log(data);

            if(!data[0].notes) {
                res.send(null);
            }
            
            else {
                res.json(data);
            }
        });
    });

    // post route to add a new note to the database
    app.post("/note/:id", function(req, res) {

        let newNote = Note(req.body);

        newNote.save(req.body, function(error, doc) {

            // then find the associate article from the req.params.id
            Article.findOneAndUpdate({ _id: req.params.id }, { $push: {"notes": doc._id} }).exec(function(error, data) {

                res.json(data);
            });
        });
    });  
}