'use strict';

angular
  .module('app.common')
  .factory('notifyAndLeave', notifyAndLeave);

function notifyAndLeave($state, Notification) {
  return function(opts) {
    opts.type = opts.type || 'primary';

    Notification[opts.type].call(Notification, opts);

    if (opts.leave && opts.leave.to) {
      $state.go(opts.leave.to.toString(), opts.leave.params || {});
    }
  };
}