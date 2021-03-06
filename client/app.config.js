'use strict';

const appConfig = window.appConfig || {};

const serverHost = 'http://localhost:8000';

appConfig.gaTrackingID = 'UA-XXXXX-Y';
appConfig.stripePublicKey = 'your_key';

// appConfig.socketUrl = serverHost;
appConfig.apiRootUrl = serverHost + '/api';

// STREAMER GAMES page
appConfig.streamerGames = {
  itemsPerPage: 15
};

// STREAMER HIGHLIGHTS page
appConfig.streamerHighlights = {
  itemsPerPage: 15
}

// GAME HIGHTLIGHTS page
appConfig.streamerGame = {
  itemsPerPage: 15
};

appConfig.highlightModal = {
  autostart: true
};

window.appConfig = appConfig;
