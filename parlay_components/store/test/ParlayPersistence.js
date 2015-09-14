(function () {
    "use strict";
    
    describe("parlay.store.persistence", function() {
    
        beforeEach(module("parlay.store.persistence"));
        
        describe("ParlayPersistence", function () {
            var $scope, ParlayPersistence, ParlayStore;
            
            beforeEach(inject(function(_$rootScope_, _ParlayPersistence_, _ParlayStore_) {
                /*jshint newcap: false */
                $scope = _$rootScope_.$new();
                ParlayPersistence = _ParlayPersistence_;
                ParlayStore = _ParlayStore_;
            }));
            
            it("restores attributes", function () {
	            
	            var store = ParlayStore("endpoints");
	            
	            var directive_name = "parlayEndpoint";
	            
	            ParlayStore("endpoints").set(directive_name, "demo_data", {
		            velocity: 20,
		            acceleration: 5
	            });
	            
	            expect(ParlayStore("endpoints").get(directive_name, "demo_data")).toEqual({
		            velocity: 20,
		            acceleration: 5
	            });
	            
	            ParlayPersistence.monitor(directive_name, "demo_data", $scope);
	            
	            $scope.demo_data = {
		            velocity: undefined,
		            acceleration: undefined
	            };
	            	            
	            $scope.$digest();
	            
	            expect($scope.demo_data).toEqual({
		            velocity: 20,
		            acceleration: 5
	            });
	            
            });
            
            it("persists attributes", function () {
	            
	            var store = ParlayStore("endpoints");
	            
	            var directive_name = "parlayEndpoint";
	            
	            ParlayPersistence.monitor(directive_name, "demo_data", $scope);
	            
	            $scope.demo_data = {
		            velocity: undefined,
		            acceleration: undefined
	            };
	            
	            $scope.$digest();
	            
	            $scope.demo_data = {
		            velocity: 100,
		            acceleration: 200
	            };
	            	            
				$scope.$digest();	            
	            
	            expect(ParlayStore("endpoints").get(directive_name, "demo_data")).toEqual({
		            velocity: 100,
		            acceleration: 200
	            });
	            
            });
    		
        });
        
    });
    
}());