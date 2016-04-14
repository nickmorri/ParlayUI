(function () {
    "use strict";

    var module_dependencies = [];

    angular
        .module('mock.parlay.protocols.protocol', module_dependencies)
        .factory('ParlayProtocol', ParlayProtocol);

    function ParlayProtocol() {
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
            getAvailableItems: function () {
                var items = [];
                for (var i = 0; i < 5; i++) items.push({name:'Item' + i});
                return items;
            }
        };
    }

}());