var url = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
var socket = io.connect(url);
var timeout;

var $messageForm = $('#message-form');
var $messageInput = $('[name="message"]');
var $messageList = $('#messages');

function join(username) {
  socket.emit('join', username);
}

function getMessages() {
  $.ajax({
    type: 'get',
    url: url + '/messages',
    success: function(data) {
      if(data.length) {
        for(i = 0; i < data.length; i ++) {
          $messageList.append(
            '<div class="comment">' +
              '<div class="content">' +
                '<a class="author">'+data[i].username+'</a>' +
                '<div class="metadata">' +
                  '<span class="date timeago">'+data[i].datetime+'</span>' +
                '</div>' +
                '<div class="text">' +
                  data[i].message +
                '</div>' +
              '</div>' +
            '</div>'
          );
        }
        scrollToBottom();
      }
    },
    error: function(error) {
      console.log("An error occurred");
    }
  });
}

function typing(data) {
  socket.emit('typing', data);
}

function scrollToBottom() {
  if(typeof $('.ui.comments')[0] != 'undefined') {
    $('.ui.comments').scrollTop($('.ui.comments')[0].scrollHeight);
  }
}

$messageForm.submit(function(e){
  e.preventDefault();

  var message =  $messageInput.val();
  socket.emit('message', message);
  $messageInput.val('');

  return false;
});

$messageInput.on('keyup', function(e) {
  typing($messageInput.val());
  clearTimeout(timeout);
  timeout = setTimeout(typing, 1000, false);
});

socket.on('typing', function(data){
  if(data) {
    $('#info').html(
      '<div class="comment">' +
        '<div class="content">' +
          '<div class="text">' +
            data.username + data.message +
          '</div>' +
        '</div>' +
      '</div>'
    );
  } else {
    $('#info').empty();
  }
});

socket.on('message', function(data){
  $.ajax({
    type: 'post', 
    url: url + '/messages', 
    data: data,
    success: function(data) {
      $messageList.append(
        '<div class="comment">' +
          '<div class="content">' +
            '<a class="author">'+data.username+'</a>' +
            '<div class="metadata">' +
              '<span class="date timeago">'+data.datetime+'</span>' +
            '</div>' +
            '<div class="text">' +
              data.message +
            '</div>' +
          '</div>' +
        '</div>'
      );
      scrollToBottom();
    },
    error: function(error) {
      console.log(error);
    }
  });
});

socket.on('join', function(data) {
  $messageList.append(
    '<div class="comment">' +
      '<div class="content">' +
        '<a class="author">'+data.username+' is online</a>' +
      '</div>' +
    '</div>'
  );
  scrollToBottom();
});

socket.on('disconnect', function(data) {
  /*$messageList.append(
    '<div class="comment">' +
      '<div class="content">' +
        '<a class="author">'+data.username+' is offline</a>' +
      '</div>' +
    '</div>'
  );
  scrollToBottom();*/
});

getMessages();