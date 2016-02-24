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

                $scope.container = {
                    stored_values: {
                        $index: 0,
                        active_tab_index: 0
                    }
                };

                $scope.$index = undefined;
                $scope.active_tab_index = undefined;

                expect($scope.$index).toBeUndefined();
                expect($scope.active_tab_index).toBeUndefined();

                ParlayPersistence.monitor("parlayItem", "$index", $scope);
                ParlayPersistence.monitor("parlayItem", "active_tab_index", $scope);

                expect($scope.$index).toBe(0);
                expect($scope.active_tab_index).toBe(0);
	            
            });
            
            it("persists attributes", function () {

	            ParlayPersistence.monitor("parlayItem", "$index", $scope);
                ParlayPersistence.monitor("parlayItem", "active_tab_index", $scope);
	            
	            $scope.$index = 10;
                $scope.active_tab_index = 10;

                ParlayPersistence.store("test");

                /*jshint newcap: false */
                expect(ParlayStore("items").get("test").name).toEqual('test');

                /*jshint newcap: false */
                expect(ParlayStore("items").get("test").data).toEqual({
                    parlayItem: {
                        $index: 10,
                        active_tab_index: 10
                    }
                });

            });

            it("removes attribute registration", function () {
                ParlayPersistence.monitor("parlayItem", "$index", $scope);
                ParlayPersistence.monitor("parlayItem", "active_tab_index", $scope);

                $scope.$index = 10;
                $scope.active_tab_index = 10;

                ParlayPersistence.store("test");

                /*jshint newcap: false */
                expect(ParlayStore("items").get("test").name).toEqual('test');

                /*jshint newcap: false */
                expect(ParlayStore("items").get("test").data).toEqual({
                    parlayItem: {
                        $index: 10,
                        active_tab_index: 10
                    }
                });

                ParlayPersistence.remove("parlayItem", "$index");

                $scope.$index = 20;
                $scope.active_tab_index = 20;

                ParlayPersistence.store("test");

                /*jshint newcap: false */
                expect(ParlayStore("items").get("test").name).toEqual('test');

                /*jshint newcap: false */
                expect(ParlayStore("items").get("test").data).toEqual({
                    parlayItem: {
                        active_tab_index: 20
                    }
                });
            });

            it("collects all registrations", function () {

                expect(ParlayPersistence.collectAll()).toEqual({});

                $scope.$index1 = 10;
                $scope.active_tab_index1 = 10;

                ParlayPersistence.monitor('parlayItem1', "$index1", $scope);
                ParlayPersistence.monitor('parlayItem1', "active_tab_index1", $scope);

                $scope.$index2 = 10;
                $scope.active_tab_index2 = 10;

                ParlayPersistence.monitor('parlayItem2', "$index2", $scope);
                ParlayPersistence.monitor('parlayItem2', "active_tab_index2", $scope);

                expect(ParlayPersistence.collectAll()).toEqual({
                    parlayItem1: {
                        $index1: 10,
                        active_tab_index1: 10
                    },
                    parlayItem2: {
                        $index2: 10,
                        active_tab_index2: 10
                    }
                });

            });

            it("collects all attributes for a directive", function () {

                expect(ParlayPersistence.collectAll()).toEqual({});

                $scope.$index1 = 10;
                $scope.active_tab_index1 = 10;

                ParlayPersistence.monitor('parlayItem1', "$index1", $scope);
                ParlayPersistence.monitor('parlayItem1', "active_tab_index1", $scope);

                $scope.$index2 = 10;
                $scope.active_tab_index2 = 10;

                ParlayPersistence.monitor('parlayItem2', "$index2", $scope);
                ParlayPersistence.monitor('parlayItem2', "active_tab_index2", $scope);

                expect(ParlayPersistence.collectDirective('parlayItem1')).toEqual({
                    $index1: 10,
                    active_tab_index1: 10
                });

                expect(ParlayPersistence.collectDirective('parlayItem2')).toEqual({
                    $index2: 10,
                    active_tab_index2: 10
                });

            });

            it("gets all registrations for a directive", function () {

                expect(ParlayPersistence.getRegistration('parlayItem1')).toEqual([]);

                $scope.$index = 10;

                ParlayPersistence.monitor('parlayItem1', "$index", $scope);

                expect(ParlayPersistence.getRegistration('parlayItem1')[0]).toEqual(jasmine.objectContaining({
                    $scope: jasmine.any(Object),
                    directive: 'parlayItem1',
                    attribute: '$index'
                }));

            });
    		
        });
        
    });
    
}());