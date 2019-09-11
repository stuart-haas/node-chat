const express = require('express');
const router = express.Router();
const timeago = require('timeago.js');
const Session = require('../models/session.model');
const Message = require('../models/message.model');

router.get('/', Session.requireLogin, (req, res) => {
  Message.find(function (err, messages){
    if(err){
      console.log(err);
    }
    else {
      messages = messages.map((item) => formatDate(item));
      res.json(messages);
    }
  });
});

router.post('/', Session.requireLogin, (req, res) => {
  var message = new Message({
    message: req.body.message,
    username: req.body.username
  });

  message.save()
    .then(message => {
      message = formatDate(message);
      res.status(200).json(message);
    })
    .catch(err => {
      res.status(400).send("Unable to save to database");
    });
});

function formatDate(item) {
  var datetime = timeago.format(item.created_at);
  let modItem = JSON.parse(JSON.stringify(item));
  modItem.datetime = datetime;
  return modItem;
};

module.exports = router;