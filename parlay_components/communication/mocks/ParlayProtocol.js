angular.module('mock.parlay.protocols.protocol', []).factory('ParlayProtocol', [function () {
    return {
        has_subscription: false,
        getName: function () {
            return 'foo';
        },
        getLog: function () {
            return [];
        },
        hasListener: function () {
            return this.has_subscription;
        },
        subscribe: function () {
            this.has_subscription = true;
        },
        unsubscribe: function () {
            this.has_subscription = false;
        },
        getAvailableEndpoints: function () {
	        var endpoints = [];
	        for (var i = 0; i < 5; i++) endpoints.push({name:'Endpoint' + i});
	        return endpoints;
        }
    };
}]);