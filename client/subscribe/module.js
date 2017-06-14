'use strict';

angular
  .module('app.subscribe', [
    'ui.router'
  ])
  .config(config);

function config($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('app.subscribe', {
      url: '/subscribe/:handle',
      views: {
        'layout@app': {
          templateUrl:  'subscribe/subscribe.tpl.html',
          controller:   'subscribeController',
          controllerAs: 'vm'
        }
      },
      resolve: {
        handle: ($http, $stateParams, APP_CONFIG) => {
          return $stateParams.handle;
        },
        status: ($http, $stateParams, APP_CONFIG) => {
          const url = `${APP_CONFIG.apiRootUrl}/subscription/status/${$stateParams.handle}`;
          return $http.get(url).then(res => res.data);
        },
        purchaseUrl: ($http, $stateParams, APP_CONFIG) => {
          const url = `${APP_CONFIG.apiRootUrl}/subscription/process/${$stateParams.handle}`;
          return url;
        }
      },
    })
    .state('app.subscribe.success', {
      url: '/subscribe/:handle/success',
      views: {
        'layout@app': {
          templateUrl: 'subscribe/success.tpl.html'
        }
      }
    });
;
}
