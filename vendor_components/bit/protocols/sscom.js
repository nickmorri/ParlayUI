var sscom = angular.module('bit.sscom', []);

sscom.factory('SSCOM_Serial', function () {
    var Private = {};
    
    return function (configuration) {
        var Public = {
            name: "SSCOM_Serial"
        };
        
        var Private = {
            endpoints: []
        };
        
        Public.addDiscovery = function (data) {
            Private.endpoints = data.children.reduce(function (previous, current) {
                return previous.concat(current);
            });
            debugger;
        };
        
        Public.getEndpoints = function () {
            return angular.copy(Private.endpoints);
        };
        
        return Public;        
    };
});