angular.module('mock.parlay.protocols.manager', ['mock.parlay.protocols.protocol']).factory('ProtocolManager', ['$q', 'ParlayProtocol', function ($q, ParlayProtocol) {

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
            else reject({STATUS:'error'});
        });
    };
    
    Public.closeProtocol = function () {
        return $q(function (resolve, reject) {
            resolve(Public.open.pop());
        });
    };
    
    return Public;
}]);