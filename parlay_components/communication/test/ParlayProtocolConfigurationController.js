(function () {
    'use strict';
    
    describe('parlay.protocols.configuration_controller', function() {
    
    	beforeEach(module('parlay.protocols.configuration_controller'));
    	beforeEach(module('mock.parlay.protocols.manager'));
        
        describe('ProtocolConfigurationController', function () {
                var rootScope, scope, ParlayProtocolConfigurationController;                
                
                beforeEach(inject(function ($rootScope, $controller, $q) {
                    rootScope = $rootScope;
                    scope = $rootScope.$new();
                    ParlayProtocolConfigurationController = $controller('ParlayProtocolConfigurationController', {$scope: scope});
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