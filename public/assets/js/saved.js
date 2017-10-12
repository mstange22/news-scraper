let savedArticles = 0;
let currentArticleNotes = 0;
let currentSavedArticleID = "";

$(document).ready(function() {

    $.get("/saved/all", function(data) {

        console.log(data);
        savedArticles += data.length;

        if(data.length > 0) {
            displaySavedArticles(data);
        }
    });
});

// delete article button listener
$(document).on("click", ".delete-article-button", function() {

    savedArticles--;

    let articleToDelete = {title: $(this).closest(".article").find(".article-header").text()};

    $(this).closest(".article").remove();

    if(savedArticles === 0) {
        $("#saved-articles-header").text("There are no saved articles");
    }

    $.post("/delete", articleToDelete, function() {

    });
});

// click listener for article notes
$(document).on("click", ".note-button", function() {

    currentSavedArticleID = $(this).closest(".article").data("id");
    let noteSearchRoute = "/notes/" + currentSavedArticleID;
    currentArticleNotes = 0;

    $("#article-id").text(currentSavedArticleID);
    $("#note-submit-button").attr("data-id", currentSavedArticleID);

    // get route to search db for article notes
    $.get(noteSearchRoute, function(data) {

        console.log(data);
        let notes = data[0].notes;

        // populate modal with notes, if exist
        if(notes.length > 0) {

            $("#notes-container").empty();
            $("#notes-container").removeClass("empty");

            // display all notes
            for(let i = 0; i < notes.length; i++) {

                currentArticleNotes++;
                displayNote(notes[i]);
            }
        }

        $("#notes-modal").modal("toggle");
    });
});

// note submit button listener
$("#note-submit-button").click(function(event) {

    event.preventDefault();
    
    let postRoute = "/note/" + currentSavedArticleID;
    let newNote = {text: $("#new-note").val().trim()};
    $("#new-note").val("");

    // post route to update new note to database
    $.post(postRoute, newNote, function(data) {

        console.log(data);
    });

    $("#notes-modal").modal("toggle");
});

// delete note button listener
$(document).on("click", ".delete-note-button", function() {

    console.log($(this).closest(".article-note").data("id"));
    let noteID = $(this).closest(".article-note").data("id");

    $(this).closest(".article-note").remove();
    currentArticleNotes--;

    if(currentArticleNotes === 0) {

        $("#notes-container").html("<div class=\"article-note empty\">There are no notes for this article</div>");
    }

    let noteToDelete = {articleID: currentSavedArticleID, noteID: noteID};

    $.post("/note/delete/" + noteID, noteToDelete, function(data) {
        console.log(data);
    });
});

// helper function to display one note in the notes modal
function displayNote(note) {
    
    console.log(note);

    let newNote = $("<div>");
    newNote.addClass("article-note");
    newNote.attr("data-id", note._id);
    $("#notes-container").append(newNote);

    let newNoteText = $("<span>");
    newNoteText.addClass("new-note-text");
    newNoteText.text(note.text);

    let deleteNoteButton = $("<a>");
    deleteNoteButton.addClass("pure-button");
    deleteNoteButton.addClass("delete-note-button");
    deleteNoteButton.text("x");

    newNote.append(newNoteText, deleteNoteButton);
}

// display all articles received
function displaySavedArticles(articles) {

    $("#saved-articles-container").empty();
    $("#saved-articles-header").text("Saved Articles");

    for(i = 0; i < articles.length; i++) {

        displaySavedArticle(articles[i]);
    }
}

function displaySavedArticle(article) {

    // build each article
    let newArticle = $("<div>");
    newArticle.addClass("article");
    newArticle.attr("data-id", article._id);

    // head has header & save button
    let newArticleHead = $("<div>");
    newArticleHead.addClass("pure-u-1 article-head");
    newHeader = $("<h3>");
    newHeader.addClass("article-header");
    newHeader.text(article.title.trim());
    newNoteButton = $("<a>");
    newNoteButton.addClass("pure-button note-button");
    newNoteButton.text("Article Notes");
    newDeleteButton = $("<a>");
    newDeleteButton.addClass("pure-button delete-article-button");
    newDeleteButton.text("Delete from Saved");
    newArticleHead.append(newHeader, newDeleteButton, newNoteButton);

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

    $("#saved-articles-container").append(newArticle);
}