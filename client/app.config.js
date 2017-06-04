'use strict';

const appConfig = window.appConfig || {};

const serverHost = 'http://localhost:8000';

// appConfig.socketUrl = serverHost;
appConfig.apiRootUrl = serverHost + '/api';

// STREAMER GAMES page
appConfig.streamerGames = {
  itemsPerPage: 2
};

// STREAMER HIGHLIGHTS page
appConfig.streamerHighlights = {
  itemsPerPage: 3
}

// GAME HIGHTLIGHTS page
appConfig.streamerGame = {
  itemsPerPage: 3
};

window.appConfig = appConfig;
