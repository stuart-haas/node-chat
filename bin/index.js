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

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.set('views', 'bin/views');

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

const User = require('./models/user.model');

const indexRouter = require('./routes/index.route');
const messageRouter = require('./routes/message.route');
const userRouter = require('./routes/user.route')(io);

let db = 'mongodb://localhost:27017/node-chat';
//let db = 'mongodb://admin:sArDZFh2WL_tE.N@ds011308.mlab.com:11308/node-chat';

mongoose.connect(db, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
});

const connection = mongoose.connection.on('connected', () => {
  console.log("Database connected");
});

app.use(express.static('bin'));
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(router);

app.use(cookieParser());
app.use(session({
  key: 'sid',
  secret: 'secret',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: connection })
}));

app.use(indexRouter);
app.use('/user', userRouter);
app.use('/messages', messageRouter);

app.use((req, res, next) => {
  if(req.session && req.session.user) {
    User.findById(req.session.user._id)
    .then((user) => {
      let userClone = JSON.parse(JSON.stringify(user));
      delete userClone.password;
      req.session.user = userClone;
    }).catch(error => {
      return next(error);
    });
  }
  next();
});

reload(app);