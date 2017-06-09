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

  vm.msToTimeStr = msToTimeStr;

  $scope.$watch('vm.filters', function(newVal, oldVal) {
    let isChampionChanged = newVal.champion !== oldVal.champion;
    let isPageChanged = !(newVal.champion !== oldVal.champion
                          || newVal.type !== oldVal.type
                          || newVal.stage !== oldVal.stage
                          || newVal.fightType !== oldVal.fightType
                          || newVal.multiKill !== oldVal.multiKill
                          || newVal.teamFight !== oldVal.teamFight);

    $location.search('champion', newVal.champion ? newVal.champion : null);
    $location.search('type', newVal.type ? newVal.type : null);
    $location.search('stage', newVal.stage ? newVal.stage : null);
    $location.search('fightType', newVal.fightType ? newVal.fightType : null);
    $location.search('multiKill', newVal.multiKill === 'true' ? 'true' : null);
    $location.search('teamFight', newVal.teamFight === 'true' ? 'true' : null);
    $location.search('page', newVal.page > 1 ? newVal.page : null);

    if (isChampionChanged) {
      $location.search('type', null);
      $location.search('stage', null);
      $location.search('fightType', null);
      $location.search('multiKill', null);
      $location.search('teamFight', null);
    }

    if (!isPageChanged) {
      $location.search('page', null);
    }
  }, true);

  function msToTimeStr(ms) {
    const seconds = ms / 1000;

    let min = parseInt(seconds / 60).toString();
    let sec = parseInt(seconds % 60).toString();
    min = min.length == 1 ? '0' + min : min;
    sec = sec.length == 1 ? '0' + sec : sec;

    return `${min}:${sec}`;
  }
}