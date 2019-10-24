const express = require('express');
const router = express.Router();
const timeago = require('timeago.js');
const Session = require('../models/session.model');
const Message = require('../models/message.model');

router.get('/', Session.requireLogin, (req, res) => {
  Message.find((error, messages) => {
    if(error){
      console.log(error);
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
    userId: req.body.userId
  });

  message.save()
    .then(message => {
      message = formatDate(message);
      res.status(200).json(message);
    })
    .catch(error => {
      res.status(400).send(error);
    });
});

function formatDate(item) {
  var datetime = timeago.format(item.created_at);
  let itemClone = JSON.parse(JSON.stringify(item));
  itemClone.datetime = datetime;
  return itemClone;
};

module.exports = router;