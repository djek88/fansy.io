'use strict';

angular
  .module('app.streamer')
  .controller('streamerHighlightController', streamerHighlightController);

function streamerHighlightController($state, highlight) {
  const vm = this;
  const playerInstance = jwplayer("myElement");

  vm.highlight = highlight;
  vm.closePlayer = () => $state.go('^', null, { reload: true });

  playerInstance.setup({
      file: vm.highlight.video,
      image: vm.highlight.thumb
  });

  /*
  highlights -> highlight: 
                  highlight.video,
                  highlight.thumb,
                  highlight.kill/assist/death,
                  highlight.heroName,
                  stream_game.id,
                  stream_game.createdAt,
                  highlight.gameTime
                  highlight.events

  game -> highlight:  
                  highlight.video,
                  highlight.thumb,
                  highlight.kill/assist/death,
                  highlight.gameTime,
                  highlight.events

  game -> AllHighlights in one video:
                  highlight.video,
                  highlight.thumb,
                  game.kill/assist/death
  */
}