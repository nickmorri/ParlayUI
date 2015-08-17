angular.module('mock.parlay.protocols.manager', []).factory('ParlayProtocolManager', ['$q', function ($q) {

	var Public = {};
     
    Public.getOpenProtocols = function () {
        return [{
	        getAvailableEndpoints: function () {return [1];}
        }, {
	        getAvailableEndpoints: function () {return [2];}
        }];
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