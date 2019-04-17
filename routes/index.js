var express = require('express');
var router = express.Router();
var bot = require('../bot/botscript').runBot;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'BOT' });
});

/* Start BOT */
router.post('/', function(req, res, next) {
  bot(req.body)
    .then(() => res.json(200))
    .catch(err => console.log(err))
});

module.exports = router;
