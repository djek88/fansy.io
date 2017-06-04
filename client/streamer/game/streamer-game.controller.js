'use strict';

angular
  .module('app.streamer')
  .controller('streamerGameController', streamerGameController);

function streamerGameController($scope, $location, APP_CONFIG, streamerGameService, streamer, gameHighlights) {
  const vm = this;

  vm.streamer = streamer;
  vm.game = gameHighlights.game;
  vm.highlights = gameHighlights.highlights;
  vm.totalHighlightsCount = gameHighlights.totalCount;
  vm.itemsPerPage = APP_CONFIG.streamerGame.itemsPerPage;
  vm.filters = Object.assign({}, $location.search());

  $scope.$watch('vm.filters', function(newValue, oldValue) {
    $location.search('type', newValue.type ? newValue.type : null);
    $location.search('stage', newValue.stage ? newValue.stage : null);
    $location.search('fightType', newValue.fightType ? newValue.fightType : null);
    $location.search('multiKill', newValue.multiKill === 'true' ? 'true' : null);
    $location.search('teamFight', newValue.teamFight === 'true' ? 'true' : null);
    $location.search('page', newValue.page > 1 ? newValue.page : null);
  }, true);
}