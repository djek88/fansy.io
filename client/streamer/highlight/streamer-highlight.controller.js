'use strict';

angular
  .module('app.streamer')
  .controller('streamerHighlightController', streamerHighlightController);

function streamerHighlightController($state, highlight, highlightEvents) {
  const vm = this;
  const playerInstance = jwplayer("myElement");

  vm.highlight = highlight;
  vm.highlightEvents = highlightEvents;
  vm.closePlayer = closePlayer;

  playerInstance.setup({
      file: vm.highlight.video,
      image: vm.highlight.thumb,
      autostart: true
  });

  function closePlayer(e) {
    if (e.target === e.currentTarget
      || e.target === document.querySelector('strong.x-text')) {
      $state.go('^', null, { reload: true });
    }
  }
}