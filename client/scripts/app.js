var app = {};


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
      var timeCreated = moment(data.createdAt).calendar();
      $('#chats').prepend('<div class="chat"><div class="username">' + msgObj.username + '</div><p class="text">' + msgObj.text + '</p><div class="footer"><div class="created">' + timeCreated + '</div><div class="room">' + msgObj.roomname + '</div></div></div>');
    },
    error: function (data) {
      // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message');
    }
  });
};

app.addMessage = function(message){
    var timeCreated = moment(this.createdAt).calendar();
    if(this.roomname) {
      var room = "Room: " + this.roomname;
    }
    $('#chats').append('<div class="chat"><div class="username">' + this.username + '</div><p class="text">' + this.text + '</p><div class="footer"><div class="created">' + timeCreated + '</div><div class="room">' + room + '</div></div></div>');
};

app.fetch = function() {

  // var allPosts = [];

  $.ajax({
    url: this.server,
    type: 'GET',
    data: { order: '-updatedAt', limit : 50 },
    contentType: 'application/json',
    
    success: function (data) {

      $.each(data.results, function(i, item) {
        if(item.username){
          item.username = item.username.replace('<', '&lt;');
          item.username = item.username.replace('>', '&gt;');
        }

        if(this.roomname){
          if(app.rooms.indexOf(this.roomname) === -1){
            app.addRoom(this.roomname);
          }
        }

        if(item.text){
          item.text = item.text.replace('<', '&lt;');
          item.text = item.text.replace('>', '&gt;');
          app.addMessage.call(this, item);
        }
      });

      app.changeRoom();
      
      $('.username').on('click', function(){
        var newFriend = $(this).text();
        app.addFriend(newFriend);
      });

    },
    error: function (data) {
      // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to get messages');
    }
  });
};

app.changeRoom = function(){
  $('.dropdown-inverse li > a').on('click', function(e){
    $('.status').text(this.innerHTML);
    app.room = $('.status').text();
  });
};

app.clearMessages = function() {
  $('#chats').children().remove();
};

app.handleSubmit = function(){
  var textarea = $('.new-post textarea');
  //var room = $('#dropdownMenu.status').val();

  $('.submit').on('click', function(event){
    event.preventDefault();
    var msgObj = {};
    msgObj.username = app.username;
    msgObj.text = textarea.val();
    msgObj.roomname = app.room;
    app.send(msgObj);
    textarea.focusout();
    textarea.val('');
    $(this).focusout();
  });
};

app.room = "Lobby";
app.rooms = [];
app.addRoom = function(room) {
  $('#roomSelect').append('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">' + room + '</a></li>');
  app.rooms.push(room);
};

app.createRoom = function(){
  $('.addRoom').on('click', function(){
    $('.room-modal').modal('show');
  })

  $('.add-room').on('click', function(){
    var newRoom = $('#roomTitle').val();

    if(newRoom){
      if(app.rooms.indexOf(newRoom) === -1){
        $('.dropdown-menu').append('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">' + newRoom + '</a></li>');
        app.rooms.push(newRoom);
      }
    }
    $('.room-modal').modal('hide');
    app.changeRoom();
  });
};

app.username = "Anonymous";
app.changeName = function(){
  $('.postingAs').on('click', function(){
    $('.username-modal').modal('show');
  })

  $('.change-name').on('click', function(){
    var newName = $('#usernewname').val();

    if(newName){
      $('.posting-name').text(newName);
      app.username = newName;
    }

    $('.username-modal').modal('hide');
    
  });
}


app.friends = [];
app.addFriend = function(newFriend){

  if(app.friends.indexOf(newFriend) === -1 ){
    $('.friends-box ul').append('<li>' + newFriend + '</li>');
    app.friends.push(newFriend);
    $(".username:contains(" + newFriend + ")").parent().addClass('friend');
  }
  else if(app.friends.indexOf(newFriend) > -1 ){
    $('.friends-box li:contains(' + newFriend + ')').remove();
    app.friends.splice( $.inArray(newFriend, app.friends), 1 );
    $(".username:contains(" + newFriend + ")").parent().removeClass('friend');
  }
};

app.init = function() {
  $('.posting-name').text(app.username);
  app.fetch();
  app.handleSubmit();
  app.createRoom();
  app.changeName();
  $('.username').on('click', function(){
    var newFriend = $(this).text();
    console.log(newFriend);
    app.addFriend(newFriend);
  });
  // app.addFriend();

  // WHEN YOU CLICK ON THE LOGO
  $('.navbar-brand').on('click', function(){
    app.clearMessages();
    app.fetch();
  });

};


$(document).ready( function() {
  app.init();
});