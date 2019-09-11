const express = require('express');
const router = express.Router();
const Session = require('../models/session.model');

router.get('/', Session.requireLogin, (req, res) => {
  res.render('index', {user: req.session.user});
});

module.exports = router;