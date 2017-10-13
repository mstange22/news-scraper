let newArticles = [];

$(document).ready(function() {

    $.get("/new", function(result) {

        // console.log(result);
        // console.log(result.length);

        if(result.length > 0) {
            displayResults(result);
        }
    });

    $("#scrape-button").click(function() {
    
        $.get("/scrape", function(result) {

            // console.log(result);   
            // console.log(result.length);
            newArticles = result;

            $("#num-scrapes").text(result.length);
            $("#results-modal").modal("toggle");

            setTimeout(function() {
                $.get("/new", function(result) {
                
                    // console.log(result);
                    // console.log(result.length);
            
                    if(result.length > 0) {
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
        
    $.post("/save", article, function(data) {

        console.log(data);

        if(!data) {
            $("#error-modal").modal("toggle");
        }

        else {
            $("#saved-message").text(data.title);
            // $("#saved-modal").modal("toggle");
        }
    });
});

// display all articles received
function displayResults(articles) {

    $("#articles-container").empty();
    $("#articles-header").text("Unsaved Articles");

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
    newSaveButton.addClass("pure-button save-article-button");
    newSaveButton.text("Save Article");
    newArticleHead.append(newHeader, newHeaderFlag, newSaveButton);

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