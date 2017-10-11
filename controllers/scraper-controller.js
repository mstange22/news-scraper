module.exports = function(app) {

    // serve up index.handlebars on page requests
    app.get("/", function(req, res) {
        
        res.render("index");
    });

    
}