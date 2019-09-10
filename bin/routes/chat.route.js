const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send({test: 'Hello'});
});

router.post('/', (req, res) => {
  res.send(req.body);
});

module.exports = router;