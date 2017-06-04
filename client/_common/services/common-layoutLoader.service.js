'use strict';

angular
  .module('app.common')
  .factory('layoutLoader', layoutLoader);

function layoutLoader($rootScope) {
  var service = {
    on: () => $rootScope.showLoader = true,
    off: () => $rootScope.showLoader = false
  };

  $rootScope.$on('$stateChangeStart', service.on);
  $rootScope.$on('$stateChangeSuccess', service.off);
  $rootScope.$on('$stateChangeError', service.off);

  return service;
}