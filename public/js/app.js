// Grab the articles as a json
$.getJSON("/articles", function(data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].blurb + "<br />" + data[i].link + "</p>");
    }
  });
  
  
// Save Button
$(".save").on("click", function() {
  var thisId = $(this).attr("data-id");
  $.ajax({
      method: "POST",
      url: "/saved/" + thisId
  }).then(function(data) {
      window.location = "/"
  })
});

// Delete Button
$(".delete").on("click", function() {
  var thisId = $(this).attr("data-id");
  $.ajax({
      method: "POST",
      url: "/delete/" + thisId
  }).then(function(data) {
      window.location = "/"
  })
});

// Get More Articles Button
$("#scrape").on("click", function() {
  console.log("scraped");
  $.ajax({
      method: "GET",
      url: "/scrape",
  }).then(function(data) {
      console.log(data)
      window.location = "/"
  })
});

// Note Button
$(".save-note").on("click", function() {
  var thisId = $(this).attr("data-id");
  $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        body: $("#noteText" + thisId).val()
      //   body: $("#noteText").val()
      }
    }).then(function(data) {
        // Log the response
        console.log(data);
        // Empty the notes section
        $("#noteText" + thisId).val("");
        $(".modalNote").modal("hide");
        window.location = "/saved"
  });

});

// Delete Note Button
$(".deleteNote").on("click", function() {
  var thisId = $(this).attr("data-note-id");
  $.ajax({
      method: "POST",
      url: "/deleteNote/" + thisId,
    }).then(function(data) {
        // Log the response
        console.log(data);
        window.location = "/saved"
      })
});
  