(function () {
    "use strict";

    var module_dependencies = ['mock.parlay.protocols.protocol'];

    angular
        .module('mock.parlay.protocols.manager', module_dependencies)
        .factory('ParlayProtocolManager', ParlayProtocolManager);

    ParlayProtocolManager.$inject = ["$q", "ParlayProtocol"];
    function ParlayProtocolManager ($q, ParlayProtocol) {

        var Public = {};

        Public.getAvailableProtocols = function () {
            return [
                {
                    name: 'BarProtocol'
                },
                {
                    name: 'FooProtocol'
                }
            ];
        };

        Public.getOpenProtocols = function () {
            var protocols = [];
            for (var i = 0; i < 5; i++) protocols.push(ParlayProtocol);
            return protocols;
        };

        Public.openProtocol = function (configuration) {
            return $q(function(resolve, reject) {
                if (configuration.name === 'SuccessfulProtocol') resolve({STATUS:'ok'});
                else reject('error');
            });
        };

        Public.closeProtocol = function () {
            return $q(function (resolve) {
                resolve(Public.open.pop());
            });
        };

        return Public;
    }

}());