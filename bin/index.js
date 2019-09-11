const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const reload = require('reload');

const indexRouter = require('./routes/index.route');
const messageRouter = require('./routes/message.route');

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.set('views', 'bin/views');
app.use(express.static('bin'));
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(router);

//let db = 'mongodb://localhost:27017/node-chat';
let db = 'mongodb://admin:sArDZFh2WL_tE.N@ds011308.mlab.com:11308/node-chat';

mongoose.connect(db, { 
  useNewUrlParser: true, useUnifiedTopology: true 
});

mongoose.connection.on('connected', function(){
  console.log("Database connected");
});

app.use(indexRouter);
app.use('/messages', messageRouter);

const server = app.listen(app.get('port'), (req, res) => {
  console.log('listening on port ' + app.get('port'));
});

const io = require('socket.io').listen(server);

io.sockets.on('connection', (socket) => {
  socket.on('join', function(username) {
      socket.username = username;
      io.emit('online', {username: socket.username});
  });

  socket.on('disconnect', () => {
    io.emit('offline', {username: socket.username});
  });

  socket.on('message', (message) => {
    io.emit('message', {username: socket.username, message: message});
  });

  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', data ? {username: socket.username, message: ' is typing...'} : false);
  });
});

reload(app);