'use strict';

angular
  .module('app.streamer', [
    'ui.router',
    'ui.bootstrap'
  ])
  .config(config);

function config($stateProvider) {
  $stateProvider
    .state('app.streamer', {
      abstract: true,
      url: '/streamer/:nickname',
      views: {
        'layout@app': {
          templateUrl: 'streamer/layout.tpl.html'
        },
        'header@app.streamer': {
          templateUrl: 'streamer/header.tpl.html'
        }
      },
      resolve: {
        streamer: ($http, $stateParams, APP_CONFIG) => {
          const url = `${APP_CONFIG.apiRootUrl}/streamer/${$stateParams.nickname}`;
          return $http.get(url).then(res => res.data);
        }
      }
    })
    .state('app.streamer.games', {
      url: '/games?page',
      data: {
        title: 'Games'
      },
      views: {
        'content@app.streamer': {
          templateUrl: 'streamer/games/streamer-games.tpl.html',
          controller: 'streamerGamesController',
          controllerAs: 'vm'
        }
      },
      resolve: {
        games: ($http, $stateParams, APP_CONFIG, streamer) => {
          const url = `${APP_CONFIG.apiRootUrl}/streamer/${streamer.id}/games`;
          const config = {
            params: {
              skip: ($stateParams.page - 1) * APP_CONFIG.streamerGames.itemsPerPage,
              limit: APP_CONFIG.streamerGames.itemsPerPage
            }
          };

          return $http.get(url, config).then(res => res.data);
        }
      }
    })
    .state('app.streamer.game', {
      url: '/game/:gameId?page&type&stage&fightType&multiKill&teamFight',
      data: {
        title: 'Game'
      },
      views: {
        'content@app.streamer': {
          templateUrl: 'streamer/game/streamer-game.tpl.html',
          controller: 'streamerGameController',
          controllerAs: 'vm'
        }
      },
      resolve: {
        gameHighlights: ($http, $stateParams, APP_CONFIG) => {
          const url = `${APP_CONFIG.apiRootUrl}/game/${$stateParams.gameId}/highlights`;
          const config = {
            params: {
              type: $stateParams.type,
              stage: $stateParams.stage,
              fightType: $stateParams.fightType,
              multiKill: $stateParams.multiKill,
              teamFight: $stateParams.teamFight,
              skip: ($stateParams.page - 1) * APP_CONFIG.streamerGame.itemsPerPage,
              limit: APP_CONFIG.streamerGame.itemsPerPage
            }
          };

          return $http.get(url, config).then(res => res.data);
        }
      }
    })
    .state('app.streamer.game.highlight', {
      url: '/highlight/:highlightId',
      data: {
        title: 'Highlight'
      },
      views: {
        'highlightPopup@app.streamer': {
          templateUrl: 'streamer/highlight/streamer-highlight.tpl.html',
          controller: 'streamerHighlightController',
          controllerAs: 'vm'
        }
      },
      resolve: {
        highlight: ($stateParams, gameHighlights) => {
          const highlights = gameHighlights.highlights;

          for (let i = highlights.length - 1; i >= 0; i--) {
            if (highlights[i].id == $stateParams.highlightId) {
              return {
                thumb: highlights[i].thumb,
                video: highlights[i].video,
                killScore: highlights[i].killScore,
                assistScore: highlights[i].assistScore,
                deathScore: highlights[i].deathScore,
                heroName: null,
                gameId: null,
                gameDate: null,
                gameTime: null,
                events: null
              };
            }
          }
        }
      }
    })
    .state('app.streamer.highlights', {
      url: '/highlights?page&champion&type&stage&fightType&multiKill&teamFight',
      data: {
        title: 'Highlights'
      },
      views: {
        'content@app.streamer': {
          templateUrl: 'streamer/highlights/streamer-highlights.tpl.html',
          controller: 'streamerHighlightsController',
          controllerAs: 'vm'
        }
      },
      resolve: {
        highlightsData: ($http, $stateParams, APP_CONFIG, streamer) => {
          const url = `${APP_CONFIG.apiRootUrl}/streamer/${streamer.id}/highlights`;
          const config = {
            params: {
              champion: $stateParams.champion,
              type: $stateParams.type,
              stage: $stateParams.stage,
              fightType: $stateParams.fightType,
              multiKill: $stateParams.multiKill,
              teamFight: $stateParams.teamFight,
              skip: ($stateParams.page - 1) * APP_CONFIG.streamerHighlights.itemsPerPage,
              limit: APP_CONFIG.streamerHighlights.itemsPerPage
            }
          };

          return $http.get(url, config).then(res => res.data);
        },
        champions: ($http, $stateParams, APP_CONFIG, streamer) => {
          const url = `${APP_CONFIG.apiRootUrl}/streamer/${streamer.id}/highlights/champions`;
          return $http.get(url).then(res => res.data);
        }
      }
    })
    .state('app.streamer.highlights.highlight', {
      url: '/:highlightId',
      data: {
        title: 'Highlight'
      },
      views: {
        'highlightPopup@app.streamer': {
          templateUrl: 'streamer/highlight/streamer-highlight.tpl.html',
          controller: 'streamerHighlightController',
          controllerAs: 'vm'
        }
      },
      resolve: {
        highlight: ($stateParams, highlightsData) => {
          const highlights = highlightsData.highlights;

          for (let i = highlights.length - 1; i >= 0; i--) {
            if (highlights[i].id == $stateParams.highlightId) {
              return {
                thumb: highlights[i].thumb,
                video: highlights[i].video,
                killScore: highlights[i].killScore,
                assistScore: highlights[i].assistScore,
                deathScore: highlights[i].deathScore,
                heroName: highlights[i].heroName,
                gameId: highlights[i].gameId,
                gameDate: highlights[i].gameDate,
                gameTime: null,
                events: null
              };
            }
          }
        }
      }
    });
}