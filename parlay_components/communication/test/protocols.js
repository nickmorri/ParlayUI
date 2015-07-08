(function () {
    "use strict";

    angular.module('mock.promenade.broker', [])
        .factory('PromenadeBroker', ['$q', function($q) {
            var Public = {
                    connected: false
            };
            
            var Private = {
                onOpen: []
            };
            
            Public.onOpen = function (callback) {
                callback();
            };
            
            Public.onClose = function (callback) {
                callback();
            };
            
            Public.onMessage = function () {
                
            };
            
            Public.onOpenSize = function () {
                return Private.onOpen.length;
            };
            
            Public.requestAvailableProtocols = function () {
                return [];
            };
            
            Public.requestOpenProtocols = function () {
                return [];
            };
            
            return Public;
        }]);
        
    angular.module('mock.parlay.protocols', []).factory('ProtocolManager', ['$q', function ($q) {
        var Public = {
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
    
    describe('parlay.protocols', function() {
    
        beforeEach(module('parlay.protocols'));
        beforeEach(module('mock.promenade.broker'));
        
        describe('Protocol', function () {
            
            it('constructs', inject(function(_Protocol_) {
                var protocol = _Protocol_({name: 'TestProtocol', protocol_type: 'TestProtocolType'});
                expect(protocol.name).toBe('TestProtocol');
                expect(protocol.type).toBe('TestProtocolType');
            }));

        });
        
        describe('ProtocolManager', function () {
            var ProtocolManager;
            
            beforeEach(inject(function(_ProtocolManager_) {
                ProtocolManager = _ProtocolManager_;
            }));
            
            xdescribe('initialization', function () {
                spyOn(ProtocolManager._private, 'clearProtocols');
                
                it('registers a onClose with PromenadeBroker', function () {
                    expect(ProtocolManager._private.clearProtocols).toHaveBeenCalled();
                });
                
            });
            
        });
        
        describe('Protocol Controllers', function () {
            
            beforeEach(module('mock.parlay.protocols'));
            
            describe('ProtocolConnectionController', function () {
            	var scope, protocolConnectionController;
            	
            	beforeEach(inject(function ($rootScope, $controller) {
                	scope = $rootScope.$new();
                	protocolConnectionController = $controller('ProtocolConnectionController', {$scope: scope});
            	}));
            	
            	describe('protocol manager checks', function () {
                	
                	it('gets open protocols', function () {
                    	expect(scope.getOpenProtocols().length).toBe(1);
                	});
                	
                	it('if there are open protocols', function () {
                    	expect(scope.hasOpenProtocols()).toBeTruthy();
                	});
                	
            	});
            	
            	xdescribe('protocol manager interactions', function () {
                	
                	it('configures a protocol', function () {});
                	
                	it('closes a protocol', function () {
                    	expect(scope.hasOpenProtocols()).toBeTruthy();
                    	scope.closeProtocol();
                    	expect(scope.hasOpenProtocols()).toBeFalsy();
                	});
                	
            	});
            	
            });
        
            describe('ProtocolConfigurationController', function () {
                
            });
            
        });
        
    });
    
}());