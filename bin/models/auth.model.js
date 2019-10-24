const bcrypt = require('bcrypt');
const User = require('../models/user.model');

class Auth {

  static get ERROR() {
    return {
      USER: {
        MATCH: "USER_MATCH",
        NO_MATCH: "USER_NO_MATCH"
        
      },
      PASSWORD: {
        NO_MATCH: "PASSWORD_NO_MATCH"
      }
    }
  };

  static hash(password, salt, callback) {
    bcrypt.hash(password, salt, callback);
  };

  static validate(username, password, passwordConf, callback) {
    User.findOne({username: username}).exec()
    .then((user) => {
      if(user) {
        return callback(user.username, null, Auth.ERROR.USER.MATCH);
      } else {
        if(password == passwordConf) {
          return callback(username, password);
        }
        else {
          return callback(username, null, Auth.ERROR.PASSWORD.NO_MATCH);
        }
      }
    });
  };

  static authenticate(username, password, callback) {
    User.findOne({username: username}).exec()
    .then((user) => {
      if(!user) {
        return callback(username, Auth.ERROR.USER.NO_MATCH);
      } else {
        bcrypt.compare(password, user.password, (error, result) => {
          if(result)
            return callback(user, null);
          else
            return callback(user.username, Auth.ERROR.PASSWORD.NO_MATCH);
        });
      }
    });
  };
}

module.exports = Auth;

