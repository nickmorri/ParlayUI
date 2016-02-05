(function () {
    "use strict";

    describe("promenade.items.standarditem", function() {
    
        beforeEach(module("promenade.items.standarditem.commands"));
        beforeEach(module("RecursionHelper"));

		describe("PromenadeStandardItemCommandController", function () {
            var scope, rootScope, ctrl, $timeout;
    
            beforeEach(inject(function($rootScope, $controller, $q, _$timeout_) {
                rootScope = $rootScope;
    			scope = $rootScope.$new();
    			$timeout = _$timeout_;

				var messageID = 100;

    			scope.item = {
                    name: "mockItem",
					getMessageId: function () {
						return messageID;
					},
                    sendMessage: function (message) {
                        return $q(function (resolve, reject) {
                            if (message.COMMAND === "send") resolve({ TOPICS: { MSG_STATUS: "ok" } });
                            else reject({ TOPICS: { MSG_STATUS: "error" } });
                        });
                    }
                };
                
                scope.container = {ref: scope.item, uid: 1000};
                
    			ctrl = $controller("PromenadeStandardItemCardCommandTabController", {$scope: scope}, {item: scope.item});
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

	        		spyOn(scope.item, "sendMessage").and.callThrough();
                    
                    // Passing undefined for $event
                    ctrl.send(undefined);
                    expect(scope.item.sendMessage).toHaveBeenCalled();
                    rootScope.$apply();
                    $timeout.flush();
                    
                    expect(ctrl.sending).toBeFalsy();
        		});
        		
        		it("unsuccessfully", function () {
	        		
            		scope.wrapper = {
		        		message: {
			        		COMMAND: "fail",
			        		test: {}
		        		}
	        		};
	        		
	        		expect(ctrl.sending).toBeFalsy();

	        		spyOn(scope.item, "sendMessage").and.callThrough();
	        		
	        		// Passing undefined for $event
                    ctrl.send(undefined);
                    expect(scope.item.sendMessage).toHaveBeenCalled();
                    rootScope.$apply();

        		    expect(ctrl.sending).toBeFalsy();
        		});
            		
            });    		
    		
        });
        
	});
	
}());