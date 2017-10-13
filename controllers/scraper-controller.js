const request = require("request");
const cheerio = require("cheerio");

let Note = require("../models/Note.js");
let Article = require("../models/Article.js");

let scrapedArticles = [];
let existingArticles = [];
let newArticles = [];
let articleMatch = false;

module.exports = function(app) {

    // Route displays landing page
    app.get("/", function(req, res) {
        res.render("index");
    });

    // route displays saved articles page
    app.get("/saved", function(req, res) {
        res.render("saved");
    });

    // get route to return all non-saved articles in the database
    app.get("/new", function(req, res) {
        
        Article.find({isSaved: false}, function(error, data) {

            if (error) {
                console.log(error);
            }
            else {
                res.json(data);
            }
        });
    });

    // get route to return all articles in the database
    app.get("/saved/all", function(req, res) {

        Article.find({isSaved: true}, function(error, data) {

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

        scrapedArticles = [];
        newArticles = [];
        let newArticle = {};

        // get all existing articles for comparison
        Article.find({}, function(error, data){
            existingArticles = data;
        })
        
        request("https://www.nytimes.com/section/business", function(error, response, html) {
    
            let $ = cheerio.load(html);
            
            // for every headline on the page
            $("h2.headline").each(function(index, element) {
    
                let link = $(element).find("a").attr("href");
                let title = $(element).find("a").text();
                let summary = $(element).closest(".story-body").find(".summary").text();
                let byline = $(element).closest(".story-body").find(".author").text();
        
                // if the headline has a link, collect the entire article object and add it to array
                if(link) {
    
                    newArticle = { title: title, link: link, summary: summary, byline: byline, isSaved: false };
                    scrapedArticles.push(newArticle);
                }
            });

            // if there are articles in the database, compare with incoming array to avoid duplicates
            if(existingArticles) {

                for(let i = 0; i < scrapedArticles.length; i++) {

                    articleMatch = false;

                    //compare articleArray[0] with elements in existing Articles
                    for(let j = 0; j < existingArticles.length; j++) {

                        if(scrapedArticles[i].title.trim() === existingArticles[j].title.trim()) {
                            
                            // if a match is found, break out of existing articles loop
                            articleMatch = true;
                            break;
                        }
                    }

                    // if we did not find a match
                    if(!articleMatch) {

                        newArticles.push(scrapedArticles[i]);
                    }
                }
            }

            // if there are new articles
            if(newArticles.length > 0) {
                Article.insertMany(newArticles);    
            }
            res.send(newArticles);
        });
    });

    // post route receives an article to save
    app.post("/save", function(req, res) {

        // check to see if the article is already saved
        Article.find({ title: req.body.title }, function(error, result) {

            // if not already saved, update isSaved property to true
            if(!result.isSaved) {

                Article.findOneAndUpdate({ title: req.body.title }, {isSaved: true}).exec(function(error, data) {
                    res.json(data);
                });
            }

            else {
                res.json(null);
            }
        });

    });

    // unsave route to remove an article from the saved articles list 
    app.post("/unsave", function(req, res) {

        Article.findOneAndUpdate({ title: req.body.title }, {isSaved: false}).exec(function(error, data) {
        if(error) {
            console.log(error);
        }
        else {
            res.json(data);
        }
        });
    });

    // post route delete an article from the database
    app.post("/delete", function(req, res) {

        Article.findOneAndRemove({title: req.body.title}, function(error, data) {

            if(error) {
                console.log(error);
            }

            else res.json(data);
        });
    })

    // post route to delete a note from the database
    app.post("/note/delete/:id", function(req, res) {

        Note.findOneAndRemove({ _id: req.params.id }, function(error, data) {

            if(error) {
                console.log(error);
            }
            else {
                // then find the associate article from the req.params.id
                Article.update({ _id: req.body.articleID }, { $pull: {"notes": req.params.id }}).exec(function(error, data) {
                    res.json(data);
                });
            }
        });
    });

    app.get("/notes/:id", function(req, res) {

        Article.find({ _id: req.params.id })
        .populate("notes")
        .exec(function(error, data) {

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