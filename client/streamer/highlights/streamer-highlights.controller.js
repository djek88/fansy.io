'use strict';

angular
  .module('app.streamer')
  .controller('streamerHighlightsController', streamerHighlightsController);

function streamerHighlightsController($scope, $location, APP_CONFIG, streamerHighlightsService, streamer, highlightsData, champions) {
  const vm = this;

  vm.streamer = streamer;
  vm.highlights = highlightsData.highlights;
  vm.champions = champions;
  vm.totalHighlightsCount = highlightsData.totalCount || 0;
  vm.itemsPerPage = APP_CONFIG.streamerHighlights.itemsPerPage;
  vm.filters = Object.assign({}, $location.search());

  $scope.$watch('vm.filters', function(newValue, oldValue) {
    $location.search('champion', newValue.champion ? newValue.champion : null);
    $location.search('type', newValue.type ? newValue.type : null);
    $location.search('stage', newValue.stage ? newValue.stage : null);
    $location.search('fightType', newValue.fightType ? newValue.fightType : null);
    $location.search('multiKill', newValue.multiKill === 'true' ? 'true' : null);
    $location.search('teamFight', newValue.teamFight === 'true' ? 'true' : null);
    $location.search('page', newValue.page > 1 ? newValue.page : null);
  }, true);
}