var broker = angular.module('promenade.broker', ['parlay.socket']);

broker.factory('PromenadeBroker', ['ParlaySocket', '$q', function (ParlaySocket, $q) {
    var Public = {};
    
    var Private = {
        socket: ParlaySocket('ws://' + location.hostname + ':8085')
    };
    
    Public.requestProtocols = function () {
        return $q(function (resolve, reject) {
            Private.socket.sendMessage({'type':'broker', 'request':'get_protocols'}, {}, {'type':'broker', 'response':'get_protocols_response'}, function (response) {
                resolve(response);
            });
        });
    };
    
    return Public;
}]);