'use strict';

angular
  .module('app.streamer')
  .controller('streamerHighlightController', streamerHighlightController);

function streamerHighlightController($state, APP_CONFIG, highlight, highlightEvents) {
  const vm = this;
  const playerInstance = jwplayer("myElement");

  vm.highlight = highlight;
  vm.highlightEvents = highlightEvents;
  vm.closePlayer = closePlayer;

  playerInstance.setup({
      file: vm.highlight.video,
      image: vm.highlight.thumb,
      autostart: APP_CONFIG.highlightModal.autostart
  });
  playerInstance.once('play', () => ga('send', 'event', 'highlight_video_played', 'played'));

  function closePlayer(e) {
    if (e.target === e.currentTarget
      || e.target === document.querySelector('strong.x-text')) {
      $state.go('^', null, { reload: true });
    }
  }

  ga('send', 'event', 'highlight_loaded', 'loaded');
}