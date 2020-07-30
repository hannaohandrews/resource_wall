
$(function () {
  $('.like').click(function () { likeFunction(this); });
});


function likeFunction(caller) {
  var postId = caller.parentElement.getAttribute('postid');
  var likeStatus = caller.parentElement.getAttribute('likestatus');
  $.ajax({
    method: "POST",
    url: `/resources/${postId}/like`,
    data: `likeStatus=${likeStatus}`,
    xhrFields: {withCredentials: true}
  }).done(() => {
    console.log("success")
  });;

  // $.ajax({
  //     type: "POST",
  //     url: `http://localhost:8080/resources/${postId}/like`,
  //     data: `likeStatus=${likeStatus}`,
  //     xhrFields: {withCredentials: true},
  //     success: function () {
  //       console.log("success")
  //       // need to update the html properties of the button
  //       // define style for each state
  //       // put the button in that state
  //     }
  // });
}
