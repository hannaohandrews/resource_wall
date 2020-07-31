$(document).ready(function() {


    $('.like').click(function () {
      likeFunction(this);
      console.log("stuff")
    });


  function likeFunction(caller) {
    var postId = caller.parentElement.getAttribute('postid');
    console.log("postif=d", postId);
    var likeStatus = caller.parentElement.getAttribute('likestatus');
    $.ajax({
      method: "POST",
      url: `/users/${postId}/like`,
      data: `likeStatus=${likeStatus}`,
      xhrFields: {withCredentials: true}
    }).done(() => {
      let newCall = caller.parentElement.getAttribute('likestatus')
      console.log("newCall:", newCall);
      let newStatus = (newCall === 'true') ? 'false' : 'true'
      console.log("newStatus:", newStatus)
      $(caller.parentElement).attr('likestatus',  String(newStatus))
      // $(caller).val(newStatus)
      $(caller).toggleClass('like')
      console.log("success")
    });;
  }
})
