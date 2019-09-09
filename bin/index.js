var reload = require('reload');
var express = require('express');
var app = express();
var moment = require('moment');

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.set('views', 'bin/views');
app.use(express.static('bin'));

app.get('/', function(req, res) {
  res.render('index');
});

var server = app.listen(app.get('port'), (req, res) => {
  console.log('listening on port ' + app.get('port'));
});

var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket) {
  socket.on('username', function(username) {
      socket.username = username;
      io.emit('online', {username: socket.username});
  });

  socket.on('disconnect', function(username) {
    io.emit('offline', {username: socket.username});
  });

  socket.on('message', function(message) {
      io.emit('message', {username: socket.username, message: message, datetime: moment(new Date()).format('hh:mm A')});
  });
});

reload(app);