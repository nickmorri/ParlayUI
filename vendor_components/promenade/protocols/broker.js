var broker = angular.module('promenade.broker', ['parlay.socket']);

broker.factory('PromenadeBroker', ['ParlaySocket', '$q', function (ParlaySocket, $q) {
    var Public = {};
    
    var Private = {
        socket: ParlaySocket('ws://' + location.hostname + ':8085')
    };
    
    /**
     * @returns {$q.defer.promise} Requests the ParlaySocket to open.
     */
    Public.connect = function () {
        return Private.socket.open();
    };
    
    /**
     * @returns {$q.defer.promise} Requests the ParlaySocket to close.
     */
    Public.disconnect = function () {
        return Private.socket.close();
    };
    
    /**
     * @returns {Boolean} Requests the ParlaySocket connection status.
     */
    Public.isConnected = function () {
        return Private.socket.isConnected();
    };
    
    Public.requestProtocols = function () {
        return $q(function (resolve, reject) {
            Private.socket.sendMessage({'type':'broker', 'request':'get_protocols'}, {}, {'type':'broker', 'response':'get_protocols_response'}, function (response) {
                resolve(response);
            });
        });
    };
    
    Public.requestDiscovery = function () {
        return $q(function (resolve, reject) {
            Private.socket.sendMessage({'type':'broker', 'request':'get_discovery'}, {}, {'type':'broker', 'response':'get_discovery_response'}, function (response) {
                resolve(response);
            });
        });
    };
    
    Public.sendMessage = Private.socket.sendMessage;
    Public.onMessage = Private.socket.onMessage;
    Public.onOpen = Private.socket.onOpen;
    Public.onClose = Private.socket.onClose;
    Public.onError = Private.socket.onError;
    
    return Public;
}]);