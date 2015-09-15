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
	            
	            /*jshint newcap: false */
	            var store = ParlayStore("endpoints");
	            
	            var directive_name = "parlayEndpoint";
	            
	            /*jshint newcap: false */
	            ParlayStore("endpoints").set(directive_name, "demo_data", {
		            velocity: 20,
		            acceleration: 5
	            });
	            
	            /*jshint newcap: false */
	            expect(ParlayStore("endpoints").get(directive_name, "demo_data")).toEqual({
		            velocity: 20,
		            acceleration: 5
	            });
	            
	            ParlayPersistence.monitor(directive_name, "demo_data", $scope);
	            
	            $scope.demo_data = {
		            velocity: undefined,
		            acceleration: undefined
	            };
	            	 
	           	// Call digest to ensure that the $watch'ers in ParlayPersistence.monitor are triggered by the scope data change.           
	            $scope.$digest();
	            
	            expect($scope.demo_data).toEqual({
		            velocity: 20,
		            acceleration: 5
	            });
	            
            });
            
            it("persists attributes", function () {
	            
	            /*jshint newcap: false */
	            var store = ParlayStore("endpoints");
	            
	            var directive_name = "parlayEndpoint";
	            
	            ParlayPersistence.monitor(directive_name, "demo_data", $scope);
	            
	            $scope.demo_data = {
		            velocity: undefined,
		            acceleration: undefined
	            };
	            
	            // Call digest to ensure that the $watch'ers in ParlayPersistence.monitor are triggered by the scope data change.
	            $scope.$digest();
	            
	            $scope.demo_data = {
		            velocity: 100,
		            acceleration: 200
	            };
	            
	            // Call digest to ensure that the $watch'ers in ParlayPersistence.monitor are triggered by the scope data change.	            
				$scope.$digest();	            
	            
	            /*jshint newcap: false */
	            expect(ParlayStore("endpoints").get(directive_name, "demo_data")).toEqual({
		            velocity: 100,
		            acceleration: 200
	            });
	            
            });
    		
        });
        
    });
    
}());