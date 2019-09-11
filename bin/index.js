const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const reload = require('reload');

const User = require('./models/user.model');

const indexRouter = require('./routes/index.route');
const messageRouter = require('./routes/message.route');
const userRouter = require('./routes/user.route');

app.locals.siteTitle = "Node Chat";

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.set('views', 'bin/views');
app.use(express.static('bin'));
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(router);

let mdb = 'mongodb://localhost:27017/node-chat';
//let mdb = 'mongodb://admin:sArDZFh2WL_tE.N@ds011308.mlab.com:11308/node-chat';

mongoose.connect(mdb, { 
  useNewUrlParser: true, useUnifiedTopology: true 
});

mongoose.connection.on('connected', function(){
  console.log("Database connected");
});

const db = mongoose.connection;

app.use(cookieParser());
app.use(session({
  key: 'sid',
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({ mongooseConnection: db })
}));

app.use((req, res, next) => {
  if(req.session && req.session.user) {
    User.findById(req.session.user._id)
    .then((user) => {
      if (user) {
        req.user = user;
        delete req.user.password;
        req.session.user = user;
      }
      next();
    });
  } else {
    next();
  }
});

app.use(indexRouter);
app.use('/user', userRouter);
app.use('/messages', messageRouter);

const server = app.listen(app.get('port'), (req, res) => {
  console.log('listening on port ' + app.get('port'));
});

const io = require('socket.io').listen(server);

io.sockets.on('connection', (socket) => {
  socket.on('join', function(username) {
      socket.username = username;
      io.emit('join', {username: socket.username});
  });

  socket.on('disconnect', () => {
    io.emit('disconnect', {username: socket.username});
  });

  socket.on('message', (message) => {
    io.emit('message', {username: socket.username, message: message});
  });

  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', data ? {username: socket.username, message: ' is typing...'} : false);
  });
});

reload(app);

exports.io = io;