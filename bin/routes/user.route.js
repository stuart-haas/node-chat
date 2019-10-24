const express = require('express');
const router = express.Router();
const Session = require('../models/session.model');
const Auth = require('../models/auth.model');
const User = require('../models/user.model');

module.exports = function(io){
  
  router.get('/logout', (req, res) => {
    Session.destroy(req, res);
  });

  router.get('/login', (req, res) => {
    res.render('login');
  });

  router.post('/login', (req, res) => {
    Auth.authenticate(req.body.username, req.body.password, (user, error) => {
      if(error) {
        if(error == Auth.ERROR.USER.NO_MATCH) {
          res.redirect('/user/login');
        } else if(error == Auth.ERROR.PASSWORD.NO_MATCH) {
          res.redirect('/user/login');
        }
      } else {
        req.session.user = user;
        res.redirect('/');
        io.emit('join', {username: user.username});
      }
    });
  });

  router.get('/register', (req, res) => {
    res.render('register');
  });

  router.post('/register', (req, res) => {
    Auth.validate(req.body.username, req.body.password, req.body.passwordConfirm, (user, password, error) => {
        if(error) {
          if(error == Auth.ERROR.USER.MATCH) {
            res.redirect('/user/register');
          } else if(error == Auth.ERROR.PASSWORD.NO_MATCH) {
            res.redirect('/user/register');
          }
        }
        else {
          Auth.hash(password, 10, (error, hash) => {
            var user = new User({
              username: req.body.username,
              password: hash
            });
            user.save()
            .then(() => {
              res.redirect('/user/login');
            });
          });
        }
      });
  });
  return router;
}