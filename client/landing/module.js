'use strict';

angular
  .module('app.landing', [
    'ui.router'
  ])
  .config(config);

function config($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('app.landing', {
      url: '/',
      views: {
        'layout@app': {
          templateUrl: 'landing/landing.tpl.html'
        }
      }
    });
}
