const bcrypt = require('bcrypt');
const User = require('../models/user.model');

exports.ERROR = {
  USER: {
    MATCH: "USER_MATCH",
    NO_MATCH: "USER_NO_MATCH"
    
  },
  PASSWORD: {
    NO_MATCH: "PASSWORD_NO_MATCH"
  }
};

exports.hash = (password, salt, callback) => {
  bcrypt.hash(password, salt, callback);
};

exports.validate = (username, password, passwordConf, callback) => {
  User.findOne({username: username}).exec()
  .then((user) => {
    if(user) {
      return callback(user.username, null, exports.ERROR.USER.MATCH);
    } else {
      if(password == passwordConf) {
        return callback(username, password);
      }
      else {
        return callback(username, null, exports.ERROR.PASSWORD.NO_MATCH);
      }
    }
  });
};

exports.authenticate = (username, password, callback) => {
  User.findOne({username: username}).exec()
  .then((user) => {
    if(!user) {
      return callback(username, exports.ERROR.USER.NO_MATCH);
    } else {
      bcrypt.compare(password, user.password, (error, result) => {
        if(result)
          return callback(user, null);
        else
          return callback(user.username, exports.ERROR.PASSWORD.NO_MATCH);
      });
    }
  });
};

