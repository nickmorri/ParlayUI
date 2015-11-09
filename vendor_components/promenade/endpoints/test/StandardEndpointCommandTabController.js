(function () {
    "use strict";

    describe("promenade.endpoints.standardendpoint", function() {
    
        beforeEach(module("promenade.endpoints.standardendpoint.commands"));
        beforeEach(module("RecursionHelper"));

		describe("PromenadeStandardEndpointCommandController", function () {
            var scope, rootScope, ctrl, $timeout;
    
            beforeEach(inject(function($rootScope, $controller, $q, _$timeout_) {
                rootScope = $rootScope;
    			scope = $rootScope.$new();
    			$timeout = _$timeout_;
    			
    			scope.endpoint = {
                    name: "mockEndpoint",
                    sendMessage: function (message) {
                        return $q(function (resolve, reject) {
                            if (message.COMMAND === "send") resolve({ TOPICS: { MSG_STATUS: "ok" } });
                            else reject({ TOPICS: { MSG_STATUS: "error" } });
                        });
                    }
                };
                
                scope.container = {ref: scope.endpoint, uid: 1000};
                
    			ctrl = $controller("PromenadeStandardEndpointCardCommandTabController", {$scope: scope}, {endpoint: scope.endpoint});
    		}));
    		
    		it("initial values", function () {
                expect(ctrl.sending).toBeFalsy();
    		});
    		
    		describe("sending", function () {
        		
        		it("successfully", function () {
	        		
	        		scope.wrapper = {
		        		message: {
			        		COMMAND: "send",
			        		test: {}
		        		}
	        		};
	        		
	        		expect(ctrl.sending).toBeFalsy();
	        		expect(ctrl.error).toBeFalsy();
	        		
	        		spyOn(scope.endpoint, "sendMessage").and.callThrough();
                    
                    // Passing undefined for $event
                    ctrl.send(undefined);
                    expect(scope.endpoint.sendMessage).toHaveBeenCalled();
                    rootScope.$apply();
                    expect(ctrl.status_message).toEqual("ok");
                    $timeout.flush();
                    
                    expect(ctrl.sending).toBeFalsy();
                    expect(ctrl.error).toBeFalsy();
                    expect(ctrl.status_message).toEqual(null);
        		});
        		
        		it("unsuccessfully", function () {
	        		
            		scope.wrapper = {
		        		message: {
			        		COMMAND: "fail",
			        		test: {}
		        		}
	        		};
	        		
	        		expect(ctrl.sending).toBeFalsy();
	        		expect(ctrl.error).toBeFalsy();
	        		
	        		spyOn(scope.endpoint, "sendMessage").and.callThrough();
	        		
	        		// Passing undefined for $event
                    ctrl.send(undefined);
                    expect(scope.endpoint.sendMessage).toHaveBeenCalled();
                    rootScope.$apply();

        		    expect(ctrl.sending).toBeFalsy();
        		    expect(ctrl.error).toBeTruthy();
        		    expect(ctrl.status_message).toEqual("error");
        		});
            		
            });    		
    		
        });
        
	});
	
}());