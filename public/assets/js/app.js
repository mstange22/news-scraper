$(document).ready(function() {

    $.get("/new", function(result) {

        console.log(result);
        console.log(result.length);

        if(result.length > 0) {
            displayResults(result);
        }
    });

    $("#scrape-button").click(function() {
    
        $.get("/scrape", function(result) {

            console.log(result);   
            console.log(result.length);

            $("#num-scrapes").text(result.length);
            $("#results-modal").modal("toggle");
            displayResults(result);

            // setTimeout(function() {

            //     $.get("new", function(result) {
            //         displayResults(result);
            //     });

            // }, 500);
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
    $("#articles-header").text("New Articles");

    for(i = 0; i < articles.length; i++) {

        displayArticle(articles[i]);
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
    newSaveButton = $("<a>");
    newSaveButton.addClass("pure-button save-article-button");
    newSaveButton.text("Save Article");
    newArticleHead.append(newHeader, newSaveButton);

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