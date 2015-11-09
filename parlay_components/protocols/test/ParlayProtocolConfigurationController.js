(function () {
    "use strict";
    
    describe("parlay.protocols.configuration_controller", function() {
    
    	beforeEach(module("parlay.protocols.configuration_controller"));
    	beforeEach(module("mock.parlay.protocols.manager"));
        
        describe("ProtocolConfigurationController", function () {
                var rootScope, scope, ctrl;                
                
                beforeEach(inject(function ($rootScope, $controller, $q) {
                    rootScope = $rootScope;
                    scope = $rootScope.$new();
                    ctrl = $controller("ParlayProtocolConfigurationController", {$scope: scope});
                }));
                
                it("initial state", function () {
                    expect(ctrl.selected_protocol).toBe(null);
                    expect(ctrl.connecting).toBeFalsy();
                });
                
                it("searches for available protocols", function() {
                    expect(ctrl.filterProtocols("")).toEqual([ { name: "BarProtocol" }, { name: "FooProtocol" } ]);
                    expect(ctrl.filterProtocols("foo")).toEqual([ { name: "FooProtocol" } ]);
                });
                
                it("searches for default parameters", function () {
                    expect(ctrl.filterDefaults(["test", "foo", "bar", "foobar"], "")).toEqual(["test", "foo", "bar", "foobar"]);
                    expect(ctrl.filterDefaults(["test", "foo", "bar", "foobar"], "foo")).toEqual(["foo", "foobar"]);
                });
                
                it("checks if selected protocol has parameters", function() {
                    ctrl.selected_protocol = { name: "SuccessfulProtocol", parameters: {"test": {value: 1}, "foo": {value: 2}, "bar": {value: 3}} };
                    expect(ctrl.selectedProtocolHasParameters()).toBeTruthy();
                });
                
                it("connects a configured protocol", function () {
                    expect(ctrl.connecting).toBeFalsy();
                    
                    ctrl.selected_protocol = { name: "SuccessfulProtocol", parameters: {"test": {value: 1}, "foo": {value: 2}, "bar": {value: 3}} };
                    
                    ctrl.connect();
                    rootScope.$apply();
                    
                    expect(ctrl.connecting).toBeTruthy();
                });
                
                it("fails to connect a protocol", function () {
                    expect(ctrl.connecting).toBeFalsy();
                    
                    ctrl.selected_protocol = { name: "FailureProtocol", parameters: {"test": {value: 1}, "foo": {value: 2}, "bar": {value: 3}} };
                    
                    ctrl.connect();
                    rootScope.$apply();
                    
                    expect(ctrl.connecting).toBeFalsy();
                    expect(ctrl.error).toBeTruthy();
                    expect(ctrl.error_message).toBe("error");
                });
                
            });
        
    });
    
}());