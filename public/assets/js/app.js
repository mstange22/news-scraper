let newArticles = [];
let displayedArticles = 0;

$(document).ready(function() {

    $.get("/new", function(result) {

        if(result.length > 0) {
            
            displayedArticles = result.length;
            displayResults(result);
        }
    });

    $("#scrape-button").click(function() {
    
        $.get("/scrape", function(data) {

            newArticles = data;

            $("#num-scrapes").text(data.length);
            $("#results-modal").modal("toggle");

            setTimeout(function() {
                $.get("/new", function(result) {
                            
                    if(result.length > 0) {
                        displayedArticles = result.length;
                        displayResults(result);
                    }
                });
            }, 500);
        });
    });
});

// click handler for save article button
$(document).on("click", ".save-article-button", function() {

    let article = {
        title: $(this).closest(".article").find(".article-header").text(),
        link: $(this).closest(".article").find(".article-link").text(),
        summary: $(this).closest(".article").find(".article-summary").text(),
        isSaved: true
    };

    // remove article from page
    $(this).closest(".article").remove();
    displayedArticles--;
    
    if(displayedArticles === 0) {
        $("#articles-header").text("There are no unsaved articles to display");
    }
        
    $.post("/save", article, function(data) {});
});

$(document).on("click", ".delete-article-button", function() {

    let articleToDelete = {title: $(this).closest(".article").find(".article-header").text()};

    // remove article from page
    $(this).closest(".article").remove();
    displayedArticles--;
    
    if(displayedArticles === 0) {
        $("#articles-header").text("There are no unsaved articles to display");
    }

    $.post("/delete", articleToDelete, function(data) {})
})

// display all articles received
function displayResults(articles) {

    $("#articles-container").empty();
    $("#articles-header").empty();

    // first display new articles
    for(let i = 0; i < newArticles.length; i++) {
        displayArticle(newArticles[i]);
    }

    // then display old articles from entire list
    for(let i = 0; i < articles.length; i++) {

        if(!isNewArticle(articles[i])) {
            displayArticle(articles[i]);
        }
    }
}

function displayArticle(article) {

    // build each article
    let newArticle = $("<div>");
    newArticle.addClass("article");

    // head has header & save button
    let newArticleHead = $("<div>");
    newArticleHead.addClass("pure-u-1 article-head");
    newHeader = $("<h3>");
    newHeader.addClass("article-header");
    newHeader.text(article.title.trim());
    let newHeaderFlag = $("<span>");
    newHeaderFlag.addClass("new-article-flag");

    if(isNewArticle(article)) {
        newHeaderFlag.text("New!");
        newHeaderFlag.addClass("visible");
    }

    newSaveButton = $("<a>");
    newSaveButton.addClass("pure-button delete-article-button");
    newSaveButton.text("Delete Article");
    newDeleteButton = $("<a>");
    newDeleteButton.addClass("pure-button save-article-button");
    newDeleteButton.text("Save Article");
    newArticleHead.append(newHeader, newHeaderFlag, newDeleteButton, newSaveButton);

    // body has summary and link
    newArticleBody = $("<div>");
    newArticleBody.addClass("pure-u-1 article-body");
    newSummary = $("<span>");
    newSummary.addClass("article-summary");
    newSummary.text(article.summary);
    newArticleLink = $("<a>");
    newArticleLink.addClass("article-link");
    newArticleLink.attr("href", article.link);
    newArticleLink.attr("target", "_blank");
    newArticleLink.text(article.link);
    newArticleBody.append(newSummary, newArticleLink);
    
    newArticle.append(newArticleHead, newArticleBody);

    $("#articles-container").append(newArticle);
}

// helper function to determine if article is new
function isNewArticle(article) {

    for(let i = 0; i < newArticles.length; i++) {

        if(article.title === newArticles[i].title) {
            return true;
        }
    }
    return false;
}