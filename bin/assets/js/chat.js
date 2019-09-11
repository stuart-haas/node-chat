$(function() {

  var url = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
  var socket = io.connect(url);
  var timeout;

  function getMessages() {
    $.ajax({
      type: 'get',
      url: url + '/messages',
      success: function(response) {
        if(response.length) {
          for(i = 0; i < response.length; i ++) {
            $('#messages').append(
              '<div class="comment">' +
                '<div class="content">' +
                  '<a class="author">'+response[i].username+'</a>' +
                  '<div class="metadata">' +
                    '<span class="date timeago">'+response[i].datetime+'</span>' +
                  '</div>' +
                  '<div class="text">' +
                    response[i].message +
                  '</div>' +
                '</div>' +
              '</div>'
            );
          }
          scrollToBottom();
        }
      },
      error: function(err) {
        console.log("An error occurred");
      }
    });
  }

  function typing(data) {
    socket.emit('typing', data);
  }

  function scrollToBottom() {
    $('.ui.comments').scrollTop($('.ui.comments')[0].scrollHeight);
  }

  $('form').submit(function(e){
    e.preventDefault();

    var message =  $('#message').val();
    socket.emit('message', message);
    $('#message').val('');

    return false;
  });

  $('#message').on('keyup', function(e) {
    typing($('#message').val());
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
      success: function(response) {
        $('#messages').append(
          '<div class="comment">' +
            '<div class="content">' +
              '<a class="author">'+response.username+'</a>' +
              '<div class="metadata">' +
                '<span class="date timeago">'+response.datetime+'</span>' +
              '</div>' +
              '<div class="text">' +
                response.message +
              '</div>' +
            '</div>' +
          '</div>'
        );
        scrollToBottom();
      },
      error: function(err) {
        console.log("An error occurred");
      }
    });
  });

  socket.on('online', function(data) {
    $('#messages').append(
      '<div class="comment">' +
        '<div class="content">' +
          '<a class="author">'+data.username+' is online</a>' +
        '</div>' +
      '</div>'
    );
    scrollToBottom();
  });

  socket.on('offline', function(data) {
    $('#messages').append(
      '<div class="comment">' +
        '<div class="content">' +
          '<a class="author">'+data.username+' is offline</a>' +
        '</div>' +
      '</div>'
    );
    scrollToBottom();
  });

  var username = prompt('Please tell me your name');
  socket.emit('join', username);

  getMessages();

});