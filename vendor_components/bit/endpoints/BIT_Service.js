var bit_endpoints = angular.module('bit.endpoints', []);

bit_endpoints.factory('CommandEndpoint', function () {
    return function CommandEndpoint (data) {

        var Private = {
            type: 'CommandEndpoint',
            directives: {}
        };
        
        var Public = {};
        
        Private.addData = function (data) {
            
        };
        
        Public.getType = function () {
            return Private.type;
        };
        
        Public.getDirectives = function () {
            return Private.directives;
        };
        
        Private.addData(data);
            
        return Public;
    };
});

bit_endpoints.factory('BIT_Service', function () {
    return function BIT_Service (data) {
        
        var Private = {
            commands: null,
            id: null,
            interfaces: null,
            name: null,
            type: 'BIT_Service',
            directives: {
                'info': 'bitEndpointCardInfo',
                'actions': 'bitEndpointCardActions'
            }
        };
        
        Private.addData = function (data) {
            Private.commands = data.commands;
            Private.id = data.id;
            Private.interfaces = data.interfaces;
            Private.name = data.name;
        };
        
        var Public = {};
        
        Public.getCommands = function () {
            return Private.commands;
        };
        
        Public.getId = function () {
            return Private.id;
        };
        
        Public.getName = function () {
            return Private.name;
        };
        
        Public.getType = function () {
            return Private.type;
        };
        
        Public.getDirectives = function () {
            return Private.directives;
        };
            
        Public.generateCommand = function (command) {
            return {
                'topics': {
                    'to_device': 0x84,
                    'from_device': 0x01,
                    'to_system': 0x00,
                    'from_system': 0xf0,
                    'to':0x0084,
                    'from': 0xf001,
                    'message_id': 200,
                    'message_type': 0
                },
                'contents': {
                    "command": 0x64, 
                    'message_info': 0,
                    "payload": {
                        "type": 0,
                        "data": []
                    }
                }
            };
        };
        
        Private.addData(data);
            
        return Public;
    };    
});

bit_endpoints.directive('bitEndpointCardInfo', function () {
    return {
        scope: {
            endpoint: "="
        },
        templateUrl: '../vendor_components/bit/endpoints/directives/bit-endpoint-info.html',
        link: function (scope, element, attributes) {
            scope.interface = scope.endpoint.getVendorInterface('BIT_Service');
        }
    };
});

bit_endpoints.directive('bitEndpointCardActions', function () {
    return {
        scope: {
            endpoint: "="
        },
        templateUrl: '../vendor_components/bit/endpoints/directives/bit-endpoint-actions.html',
        link: function (scope, element, attributes) {
            scope.interface = scope.endpoint.getVendorInterface('BIT_Service');
        }
    };
});