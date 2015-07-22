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
    
    xdescribe('parlay.protocols', function() {
    
        beforeEach(module('parlay.protocols'));
        beforeEach(module('mock.promenade.broker'));
        
        describe('Protocol', function () {
            
            it('constructs', inject(function(_Protocol_) {
                var protocol = _Protocol_({name: 'TestProtocol', protocol_type: 'TestProtocolType'});
                expect(protocol.getName()).toBe('TestProtocol');
                expect(protocol.getType()).toBe('TestProtocolType');
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
        
            describe('ProtocolConfigurationController', function () {
                
            });
            
        });
        
    });
    
}());