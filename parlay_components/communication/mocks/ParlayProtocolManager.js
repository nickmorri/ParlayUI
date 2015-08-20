angular.module('mock.parlay.protocols.manager', ['mock.parlay.protocols.protocol']).factory('ParlayProtocolManager', ['$q', 'ParlayProtocol', function ($q, ParlayProtocol) {

	var Public = {};
     
    Public.getOpenProtocols = function () {
	    var protocols = [];
	    for (var i = 0; i < 5; i++) protocols.push(ParlayProtocol);
        return protocols;
    };
    
    Public.openProtocol = function () {
        return $q(function (resolve, reject) {
            resolve(Public.push({}));
        });
    };
    
    Public.closeProtocol = function () {
        return $q(function (resolve, reject) {
            resolve(Public.open.pop());
        });
    };
    
    return Public;
}]);