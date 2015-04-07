var app = {};
var currentPosts = [];

app.server = 'https://api.parse.com/1/classes/chatterbox';

app.send = function(msgObj){
  
  $.ajax({
    // always use this url
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'POST',
    data: JSON.stringify(msgObj),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
      console.log(data);
      // app.addMessage.call('', msgObj);

      var chatPost = $('.template .msgContainer').clone();
      chatPost.find('.username').html(msgObj.username);
      chatPost.find('.message').html(msgObj.text);
      chatPost.find('.roomname').html(msgObj.roomname);
      $('#chats').prepend(chatPost);

    },
    error: function (data) {
      // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message');
    }
  });
};

  
app.init = function() {

};

app.addMessage = function(message){
    var chatPost = $('.template .msgContainer').clone();
    chatPost.find('.username').html(this.username);
    chatPost.find('.message').html(this.text);
    chatPost.find('.created').html(this.createdAt);
    chatPost.find('.roomname').html(this.roomname);
    $('#chats').prepend(chatPost);
}

app.fetch = function() {

  var allPosts = [];

  $.ajax({
    url: this.server,
    type: 'GET',
    data: { order: '-updatedAt', limit : 20 },
    contentType: 'application/json',
    
    success: function (data) {

      var newPosts = [];

      if(data.results.length > currentPosts.length){
        var newPosts = _.difference(data.results, currentPosts);
        console.log(newPosts);
        currentPosts.push.apply(currentPosts, newPosts);
      }

      if(newPosts.length > 0){
        $.each(newPosts, function(i, item) {
          if(item.text){
            item.text = item.text.replace('<', '&lt;');
            item.text = item.text.replace('>', '&gt;');
          }
          if(item.username){
            item.username = item.username.replace('<', '&lt;');
            item.username = item.username.replace('>', '&gt;');
          }
          
          app.addMessage.call(this, item);
          
        });
      }
    },
    error: function (data) {
      // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to get messages');
    }
  });


}

$(document).ready( function() {

  var textarea = $('.new-post textarea');

  $('.btn').on('click', function(event){
    event.preventDefault();
    var msgObj = {};
    msgObj.username = "Joker123";
    msgObj.text = textarea.val();
    msgObj.roomname = 'lobby';
    app.send(msgObj);
  });
  app.fetch();
  setInterval(function(){app.fetch()}, 10000);

});