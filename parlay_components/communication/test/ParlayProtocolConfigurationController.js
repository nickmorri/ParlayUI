(function () {
    'use strict';

    var sample_endpoints = function () {
        var endpoints = [];
        
        for (var i = 0; i < 50; i++) {
            endpoints.push({
                ID: 100 + i,
                INTERFACES: [],
                NAME: 'TEST' + i,
                TEMPLATE: 'STD_ENDPOINT'
            });
        }
        
        return endpoints;
    }();
    
    var sample_discovery = {
        CHILDREN: sample_endpoints,
        NAME: 'TestProtocol',
        TEMPLATE: 'Protocol'
    };

    angular.module('mock.promenade.broker', [])
        .factory('PromenadeBroker', ['$q', function($q) {
            var PromenadeBroker = {
                connected: false,
                onDiscoveryCallbacks: [],
                onOpenCallbacks: [],
                onCloseCallbacks: []
            };
            
            PromenadeBroker.requestAvailableProtocols = function () {
                return $q(function (resolve, reject) {
                    resolve([]);
                });
            };
            
            PromenadeBroker.requestOpenProtocols = function () {
                return $q(function (resolve, reject) {
                    resolve([]);
                });
            };
            
            PromenadeBroker.sendSubscribe = function () {
                return $q(function (resolve, reject) {
                    resolve(true);
                });
            };
            
            PromenadeBroker.sendUnsubscribe = function () {
                return $q(function (resolve, reject) {
                    resolve(true);
                });
            };
            
            PromenadeBroker.requestDiscovery = function () {
                PromenadeBroker.onDiscoveryCallbacks.forEach(function (callback) {
                    callback({discovery: [sample_discovery]});
                });
            };
            
            PromenadeBroker.onDiscovery = function (callback) {
                PromenadeBroker.onDiscoveryCallbacks.push(callback);
            };
            
            PromenadeBroker.onOpen = function (callback) {
                PromenadeBroker.onOpenCallbacks.push(callback);
            };
            
            PromenadeBroker.onClose = function (callback) {
                PromenadeBroker.onCloseCallbacks.push(callback);
            };
            
            PromenadeBroker.onMessage = function (response_topics, response_callback) {
                if (response_topics.response === 'get_protocols_response') response_callback({
                    TestProtocol: {
                        params: ['port', 'timing'],
                        defaults: {
                            port: 10,
                            timing: 50
                        }
                    }
                });
                else if (response_topics.response === 'get_open_protocols_response') response_callback({protocols: [
                    {
                        name: 'TestProtocol',
                        protocol_type: 'PromenadeDirectMessageProtocol'
                    }
                ]});
                else response_callback(response_topics);
            };
            
            PromenadeBroker.triggerOnClose = function () {
                PromenadeBroker.onCloseCallbacks.forEach(function (callback) {
                    callback();
                });
            };
            
            PromenadeBroker.triggerOnOpen = function () {
                PromenadeBroker.onOpenCallbacks.forEach(function (callback) {
                    callback();
                });
            };
            
            PromenadeBroker.openProtocol = function (configuration) {
                return $q(function (resolve, reject) {
                    resolve(true);
                });
            };
            
            PromenadeBroker.closeProtocol = function (protocol) {
                return $q(function (resolve, reject) {
                    if (protocol === 'TestProtocol') resolve({STATUS: 'ok'});
                    else resolve({STATUS: 'error'});
                });
            };
            
            return PromenadeBroker;
        }]);
        
    angular.module('mock.parlay.protocols', []).factory('ProtocolManager', ['$q', function ($q) {
        var PromenadeBroker = {
            open: [{}]
        };
                    
        Public.getOpenProtocols = function () {
            return Public.open;
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
    
    angular.module('mock.parlay.socket', []).factory('ParlaySocket', [function () {
        var Public = {};
        
        Public.onMessage = function () {
            return function () {};
        };
        
        Public.sendMessage = function (topics, contents, response_topics, response_callback) {
            if (contents === null) {
                response_callback({STATUS: -1});
            }
            else {
                contents.STATUS = 0;
                response_callback(contents);
            }
        };
        
        return Public;
    }]);
    
    describe('parlay.protocols.configuration_controller', function() {
    
    	beforeEach(module('mock.promenade.broker'));
		beforeEach(module('mock.parlay.socket'));
        beforeEach(module('parlay.protocols.configuration_controller'));
        
        describe('ProtocolConfigurationController', function () {
                var rootScope, scope, ParlayProtocolConfigurationController, MockProtocolManager;                
                
                beforeEach(inject(function ($rootScope, $controller, $q) {
                    MockProtocolManager = {
                        getAvailableProtocols: function () {
                            return [
                                {
                                    name: 'BarProtocol'
                                },
                                {
                                    name: 'FooProtocol'
                                }
                            ];
                        },
                        openProtocol: function (configuration) {
                            return $q(function(resolve, reject) {
                                if (configuration.name === 'SuccessfulProtocol') resolve({STATUS:'ok'});
                                else reject({STATUS:'error'});
                            });
                        }
                    };
                    rootScope = $rootScope;
                    scope = $rootScope.$new();
                    ParlayProtocolConfigurationController = $controller('ParlayProtocolConfigurationController', {$scope: scope, ProtocolManager: MockProtocolManager});
                }));
                
                it('initial state', function () {
                    expect(scope.selected_protocol).toBe(null);
                    expect(scope.connecting).toBeFalsy();
                });
                
                it('searches for available protocols', function() {
                    expect(scope.filterProtocols('')).toEqual([
                        {
                            name: 'BarProtocol'
                        },
                        {
                            name: 'FooProtocol'
                        }
                    ]);
                    expect(scope.filterProtocols('foo')).toEqual([
                        {
                            name: 'FooProtocol'
                        }
                    ]);
                });
                
                it('searches for default parameters', function () {
                    expect(scope.filterDefaults(['test', 'foo', 'bar', 'foobar'], '')).toEqual(['test', 'foo', 'bar', 'foobar']);
                    expect(scope.filterDefaults(['test', 'foo', 'bar', 'foobar'], 'foo')).toEqual(['foo', 'foobar']);
                });
                
                it('checks if selected protocol has parameters', function() {
                    scope.selected_protocol = {parameters: ['test', 'foo', 'bar']};
                    expect(scope.selectedProtocolHasParameters()).toBeTruthy();
                });
                
                it('connects a configured protocol', function () {
                    expect(scope.connecting).toBeFalsy();
                    
                    scope.selected_protocol = {
                        name: 'SuccessfulProtocol',
                        parameters: ['test', 'foo', 'bar']
                    };
                    
                    scope.connect();
                    rootScope.$apply();
                    
                    expect(scope.connecting).toBeTruthy();
                });
                
                it('fails to connect a protocol', function () {
                    expect(scope.connecting).toBeFalsy();
                    
                    scope.selected_protocol = {
                        name: 'FailureProtocol',
                        parameters: ['test', 'foo', 'bar']
                    };
                    
                    scope.connect();
                    rootScope.$apply();
                    
                    expect(scope.connecting).toBeFalsy();
                    expect(scope.error).toBeTruthy();
                    expect(scope.error_message).toBe('error');
                });
                
            });
        
    });
    
}());