var sscom = angular.module('bit.sscom', []);

sscom.factory('Protocol', function () {
    var Private = {};
    
    return function (configuration) {
        
        var Public = {
            name: configuration.name,
            type: configuration.protocol_type
        };
        
        Public.addDiscovery = function (data) {
            Private.endpoints = data.children;
        };
        
        Public.getEndpoints = function () {
            return Private.endpoints;
        };
        
        return Public;        
    };
});