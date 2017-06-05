'use strict';

angular
  .module('app.streamer')
  .controller('streamerHighlightController', streamerHighlightController);

function streamerHighlightController($state, highlight, highlightEvents) {
  const vm = this;
  const playerInstance = jwplayer("myElement");

  console.log(highlight, highlightEvents);

  vm.highlight = highlight;
  vm.highlightEvents = highlightEvents;
  vm.closePlayer = () => $state.go('^', null, { reload: true });

  playerInstance.setup({
      file: vm.highlight.video,
      image: vm.highlight.thumb
  });
}