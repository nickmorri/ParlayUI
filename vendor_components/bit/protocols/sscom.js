var sscom = angular.module('bit.sscom', ['promenade.broker', 'ngMaterial']);

sscom.factory('BITServiceSSCOM', ['PromenadeBroker', function (PromenadeBroker) {
    var Private = {
        broker: PromenadeBroker
    };
    
    var Public = {};
    
    Public.sendCommand = function (command) {
        return Private.broker.sendMessage({'type': 'SSCOM'}, {'command': command}, {'response': command + "_reply"});
    };
    
    return Public;
}]);

sscom.factory('SSCOMEndpoint', ['$q', 'BITServiceSSCOM', function ($q, BITServiceSSCOM) {
    var Private = {};
    
    var Public = {};
    
    Public.setup = function () {
        return $q(function (resolve, reject) {
            resolve(Public);
        });
    };
    
    return Public;
}]);