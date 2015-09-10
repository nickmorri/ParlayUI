(function () {
    'use strict';

    describe('promenade.endpoints.standardendpoint', function() {
    
        beforeEach(module('parlay.endpoints'));
        beforeEach(module('RecursionHelper'));

		describe('PromenadeStandardEndpointCommandController', function () {
            var scope, rootScope, PromenadeStandardEndpointCommandController, timeout;
    
            beforeEach(inject(function($rootScope, $controller, $q, $timeout) {
                rootScope = $rootScope;
    			scope = $rootScope.$new();
    			timeout = $timeout;
    			
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
                
    			PromenadeStandardEndpointCommandController = $controller('PromenadeStandardEndpointCommandController', {$scope: scope});
    		}));
    		
    		it('initial values', function () {
                expect(scope.sending).toBeFalsy();
    		});
    		
    		describe('sending', function () {
        		
        		it('successfully', function () {
                    scope.message = {command: 'send', test:{}};
                    scope.send();
                    rootScope.$apply();
                    
                    expect(scope.sending).toBeTruthy();
                    timeout.flush();            		
            		expect(scope.sending).toBeFalsy();
        		});
        		
        		it('unsuccessfully', function () {
            		scope.message = {command: 'fail'};
                    scope.send();
                    rootScope.$apply();            		
        		    
        		    expect(scope.error).toBeTruthy();
        		});
            		
            });    		
    		
        });
        
	});
	
}());