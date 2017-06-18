require('dotenv').config({ silent: true });

const common = require('./components/common');
const server = require('./components/server');
const database = require('./components/database');
const gameData = require('./components/gameData');
const highlightData = require('./components/highlightData');
const heroData = require('./components/heroData');
const stripe = require('./components/stripe');

module.exports = Object
  .assign({}, common, server, database, gameData, highlightData, heroData, stripe);
