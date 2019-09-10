$(function() {

  var url = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
  var socket = io.connect(url);
  var timeout = null;

  $.ajax({
    type: 'get',
    url: url + '/chats',
    success: function(data) {
      console.log(data);
    }
  })

  function typing() {
    socket.emit('typing', false);
  }

  $('form').submit(function(e){
    e.preventDefault();

    var message =  $('#message').val();

    $.ajax({
      type: 'post', 
      url: url + '/chats', 
      data: { message: message },
      success: function(data) {
        socket.emit('message', data.message);
        $('#message').val('');
      },
      error: function(err) {
        console.log("An error occurred");
      }
    });

    return false;
  });

  $('#message').on('keyup', function(e) {
    socket.emit('typing', $('#message').val());
    clearTimeout(timeout);
    timeout = setTimeout(typing, 1000);
  });

  socket.on('typing', function(data){
    if(data) {
    $('#info').html(
      '<div class="comment">' +
        '<div class="content">' +
          '<div class="text">' +
            data.message +
          '</div>' +
        '</div>' +
      '</div>'
    );
    } else {
      $('#info').empty();
    }
  });

  socket.on('message', function(data){
    $('#messages').append(
      '<div class="comment">' +
        '<div class="content">' +
          '<a class="author">'+data.username+'</a>' +
          '<div class="metadata">' +
            '<span class="date">Today at '+data.datetime+'</span>' +
          '</div>' +
          '<div class="text">' +
            data.message +
          '</div>' +
        '</div>' +
      '</div>'
    );
  });

  socket.on('online', function(data) {
    $('#messages').append(
      '<div class="comment">' +
        '<div class="content">' +
          '<a class="author">'+data.username+' is online</a>' +
        '</div>' +
      '</div>'
    );
  });

  socket.on('offline', function(data) {
    $('#messages').append(
      '<div class="comment">' +
        '<div class="content">' +
          '<a class="author">'+data.username+' is offline</a>' +
        '</div>' +
      '</div>'
    );
  });

  var username = prompt('Please tell me your name');
  socket.emit('username', username);

});