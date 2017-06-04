'use strict';

angular
  .module('app', [
    'ui.router',
    'ui-notification',

    // App
    'app.common',
    'app.landing',
    'app.streamer',
  ])
  .config(config)
  .constant('APP_CONFIG', window.appConfig)
  .run(run);

function config($locationProvider, $httpProvider, $stateProvider, $urlRouterProvider) {
  // Enable HTML5
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });

  $httpProvider.interceptors.push(($q, $injector, layoutLoader) => {
    function notifyError(rejection) {
      console.log('http rejection:', rejection);

      var data = rejection.data || 'Lost connection!';

      if (data.error) {
        data = data.error.message;
      }

      $injector.get('notifyAndLeave')({
        type: 'error',
        title: rejection.statusText + ' ' + rejection.status.toString(),
        message: data,
        delay: 6000
      });
    }

    return {
      requestError: (rejection) => {
        layoutLoader.off();
        notifyError(rejection);

        return $q.reject(rejection);
      },
      responseError: (rejection) => {
        layoutLoader.off();
        notifyError(rejection);

        return $q.reject(rejection);
      }
    };
  });

  $stateProvider.state('app', {
    abstract: true,
    views: {
      root: {
        templateUrl: 'layout.tpl.html'
      }
    }
  });

  $urlRouterProvider.otherwise('/');
}

function run($rootScope, $state, APP_CONFIG) {
  $rootScope.$on('$stateChangeError', (event, toState, toParams, fromState, fromParams, error) => {
    if (!fromState.name) $state.go('app.landing');
  });
}