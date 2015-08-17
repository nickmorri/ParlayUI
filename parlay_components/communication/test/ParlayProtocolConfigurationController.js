(function () {
    'use strict';
    
    describe('parlay.protocols.configuration_controller', function() {
    
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