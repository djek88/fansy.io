'use strict';

angular
  .module('app.common')
  .filter('gameTime', gameTime);

function gameTime() {
  return function(seconds = 0) {
    let min = parseInt(seconds / 60).toString();
    let sec = parseInt(seconds % 60).toString();
    min = min.length == 1 ? '0' + min : min;
    sec = sec.length == 1 ? '0' + sec : sec;

    return `${min}:${sec}`;
  };
}