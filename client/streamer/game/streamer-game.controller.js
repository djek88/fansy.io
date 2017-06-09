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

  vm.msToTimeStr = msToTimeStr;

  $scope.$watch('vm.filters', function(newVal, oldVal) {
    let isPageChanged = !(newVal.type !== oldVal.type
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