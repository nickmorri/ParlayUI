(function () {
    'use strict';

    describe('promenade.items.standarditem', function() {
    
        beforeEach(module('promenade.items.standarditem.property'));
        beforeEach(module('promenade.items.property'));

		describe('PromenadeStandardItemCardPropertyTabController', function () {
            var scope, rootScope, ctrl, item, protocol, property;
    
            beforeEach(inject(function($rootScope, $controller, $q, _PromenadeStandardProperty_) {
                rootScope = $rootScope;
    			scope = $rootScope.$new();

                protocol = {
                    sendMessage: function (topics, contents, response_topics) {
                        return $q(function (resolve) { resolve({CONTENTS: {VALUE: 10}}); });
                    },
                    onMessage: function () {

                    }
                };

                property = new _PromenadeStandardProperty_({
                    NAME: "test_property1",
                    INPUT: "STRING",
                    READ_ONLY: false
                }, "TestItem", protocol);

    			item = { properties: { "property1": property } };
                
                scope.container = {ref: scope.item, uid: 1000};
                
    			ctrl = $controller('PromenadeStandardItemCardPropertyTabController', {$scope: scope}, {item: item});
    		}));
    		
    		it("initializes with default values", function() {
	    		expect(ctrl.waiting).toBeFalsy();
    		});

			it("hasProperties", function () {
                expect(ctrl.hasProperties()).toBeTruthy();
            });

            it("getAllProperties", function () {
                spyOn(protocol, "sendMessage");

                ctrl.getAllProperties();

                rootScope.$apply();

                expect(protocol.sendMessage).toHaveBeenCalledWith({
                    TX_TYPE: "DIRECT",
                    MSG_TYPE: "PROPERTY",
                    TO: "TestItem"
                },
                {
                    PROPERTY: "test_property1",
                    ACTION: "GET",
                    VALUE: null
                },
                {
                    TX_TYPE: "DIRECT",
                    MSG_TYPE: "RESPONSE",
                    FROM: "TestItem",
                    TO: "UI"
                }, true);

            });

            it("setAllProperties", function () {
                spyOn(protocol, "sendMessage");

                property.value = 10;

                ctrl.setAllProperties();

                rootScope.$apply();

                expect(protocol.sendMessage).toHaveBeenCalledWith({
                        TX_TYPE: "DIRECT",
                        MSG_TYPE: "PROPERTY",
                        TO: "TestItem"
                    },
                    {
                        PROPERTY: "test_property1",
                        ACTION: "SET",
                        VALUE: 10
                    },
                    {
                        TX_TYPE: "DIRECT",
                        MSG_TYPE: "RESPONSE",
                        FROM: "TestItem",
                        TO: "UI"
                    }, true);

            });
    		
        });
        
	});
	
}());