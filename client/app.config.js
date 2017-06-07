'use strict';

const appConfig = window.appConfig || {};

const serverHost = 'http://localhost:8000';

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
  autostart: false
};

window.appConfig = appConfig;
