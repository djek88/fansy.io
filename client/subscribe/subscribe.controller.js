'use strict';

angular
  .module('app.streamer')
  .controller('subscribeController', subscribeController);

function subscribeController($http, $state, APP_CONFIG, handle, status, purchaseUrl) {
  const vm = this;

  vm.handle       = handle;
  vm.isSubscribed = status.status;
  vm.paidTil      = status.paid_til;
  vm.purchaseUrl  = purchaseUrl;

  var handler = StripeCheckout.configure({
    key: APP_CONFIG.stripePublicKey,
    image: '/images/logo.png',
    locale: 'auto',
    token: function(token) {
      $http.post(purchaseUrl, {token})
        .then(function(res) {
          if (res.data.status == true) {
            $state.reload();
          }
        }, function(err) {
        });
    }
  });

  vm.launchStripe = function(e) {
    handler.open({
      amount:      1900,
      name:        "Fansy.io",
      description: "Early access for 3 months"
    });
    e.preventDefault();
  };

  window.addEventListener('popstate', function() {
    handler.close();
  });
}
