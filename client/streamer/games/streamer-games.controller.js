'use strict';

angular
  .module('app.streamer')
  .controller('streamerGamesController', streamerGamesController);

function streamerGamesController($scope, $location,  APP_CONFIG, streamerGamesService, streamer, games) {
  const vm = this;

  vm.streamer = streamer;
  vm.games = games;
  vm.totalGamesCount = games.length && games[0].totalNum || 0;
  vm.itemsPerPage = APP_CONFIG.streamerGames.itemsPerPage;
  vm.filters = Object.assign({}, $location.search());

  $scope.$watch('vm.filters', function(newValue, oldValue) {
    $location.search('page', newValue.page > 1 ? newValue.page : null);
  }, true);
}