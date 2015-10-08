(function () {
    'use strict';

    describe('promenade.endpoints.standardendpoint', function() {
    
        beforeEach(module('parlay.endpoints'));
        beforeEach(module('RecursionHelper'));

		describe('PromenadeStandardEndpointCommandController', function () {
            var scope, rootScope, ctrl;
    
            beforeEach(inject(function($rootScope, $controller, $q) {
                rootScope = $rootScope;
    			scope = $rootScope.$new();
    			
    			scope.endpoint = {
                    name: 'mockEndpoint',
                    sendMessage: function (message) {
                        return $q(function (resolve, reject) {
                            if (message.command === 'send') resolve('ok');
                            else reject('error');
                        });
                    }
                };
                
                scope.container = {ref: scope.endpoint, uid: 1000};
                
    			ctrl = $controller('PromenadeStandardEndpointCardCommandTabController', {$scope: scope});
    		}));
    		
    		it('initial values', function () {
                expect(ctrl.sending).toBeFalsy();
    		});
    		
    		describe('sending', function () {
        		
        		it('successfully', function () {
                    expect(ctrl.sending).toBeFalsy();
                    scope.message = {command: 'send', test:{}};
                    ctrl.send();
                    rootScope.$apply();
                    expect(ctrl.sending).toBeTruthy();            		
        		});
        		
        		it('unsuccessfully', function () {
            		scope.message = {command: 'fail'};
                    ctrl.send();
                    rootScope.$apply();            		
        		    
        		    expect(ctrl.error).toBeTruthy();
        		});
            		
            });    		
    		
        });
        
	});
	
}());