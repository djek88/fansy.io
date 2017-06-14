const express = require('express');
const cors = require('cors');
const router = express.Router();
const streamer = require('./streamer');
const game = require('./game');
const highlight = require('./highlight');
const subscription = require('./subscription');
const test = require('./test');

router.use(cors());
router.use('/streamer', streamer);
router.use('/game', game);
router.use('/highlight', highlight);
router.use('/subscription', subscription);
router.use('/test', test);

module.exports = router;
