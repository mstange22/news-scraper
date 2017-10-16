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

    // head contains text & buttons containers
    let newArticleHead = $("<div>");
    newArticleHead.addClass("pure-u-1 article-head");

    // text container
    let newArticleHeadText = $("<div>");
    newArticleHeadText.addClass("pure-u-3-4 article-head-text");

    // headline text
    newHeader = $("<h3>");
    newHeader.addClass("article-header");
    newHeader.text(article.title.trim());
    
    // new article badge
    // let newArticleBadgeContainer = $("<div>");
    // newArticleBadgeContainer.addClass("pure-u-1-12");

    let newArticleBadge = $("<span>");
    newArticleBadge.addClass("new-article-badge")
    // newArticleBadgeContainer.append(newArticleBadge);

    // if new, add badge
    if(isNewArticle(article)) {
        newArticleBadge.text("New!");
        newArticleBadge.addClass("visible");
    }

    newArticleHeadText.append(newHeader, newArticleBadge);

    // button container
    let newArticleHeadButtons = $("<div>");
    newArticleHeadButtons.addClass("pure-u-1-4 article-head-buttons");

    // save article button
    newSaveButton = $("<a>");
    newSaveButton.addClass("pure-button delete-article-button");
    newSaveButton.text("Delete");

    // delete article button
    newDeleteButton = $("<a>");
    newDeleteButton.addClass("pure-button save-article-button");
    newDeleteButton.text("Save"); 

    newArticleHeadButtons.append(newDeleteButton, newSaveButton);

    newArticleHead.append(newArticleHeadText, newArticleHeadButtons);

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