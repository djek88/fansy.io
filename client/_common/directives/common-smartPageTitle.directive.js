'use strict';

angular
  .module('app.common')
  .directive('smartPageTitle', smartPageTitle);

function smartPageTitle($rootScope, $timeout) {
  return {
    restrict: 'A',
    compile: function(element, attributes) {
      element.removeAttr('smart-page-title data-smart-page-title');

      var defaultTitle = attributes.smartPageTitle;
      var listener = function(event, toState, toParams, fromState, fromParams) {
        var title = defaultTitle;
        if (toState.data && toState.data.title) title = toState.data.title + ' | ' + title;
        // Set asynchronously so page changes before title does
        $timeout(function() {
          $('html head title').text(title);
          $('html head meta[property="og:title"]').attr( 'content', title);
        });
      };

      $rootScope.$on('$stateChangeStart', listener);
    },
  };
}