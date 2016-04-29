(function () {
    "use strict";
    
    describe("parlay.item.persistence", function() {
    
        beforeEach(module("parlay.item.persistence"));
        
        describe("ParlayItemPersistence", function () {
            var $scope, ParlayItemPersistence, ParlayStore;

            beforeEach(inject(function(_$rootScope_, _ParlayItemPersistence_, _ParlayStore_) {
                /*jshint newcap: false */
                $scope = _$rootScope_.$new();
                ParlayItemPersistence = _ParlayItemPersistence_;
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

                ParlayItemPersistence.monitor("parlayItem", "$index", $scope);
                ParlayItemPersistence.monitor("parlayItem", "active_tab_index", $scope);

                expect($scope.$index).toBe(0);
                expect($scope.active_tab_index).toBe(0);
	            
            });
            
            it("persists attributes", function () {

	            ParlayItemPersistence.monitor("parlayItem", "$index", $scope);
                ParlayItemPersistence.monitor("parlayItem", "active_tab_index", $scope);
	            
	            $scope.$index = 10;
                $scope.active_tab_index = 10;

                ParlayItemPersistence.store("test");

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
                ParlayItemPersistence.monitor("parlayItem", "$index", $scope);
                ParlayItemPersistence.monitor("parlayItem", "active_tab_index", $scope);

                $scope.$index = 10;
                $scope.active_tab_index = 10;

                ParlayItemPersistence.store("test");

                /*jshint newcap: false */
                expect(ParlayStore("items").get("test").name).toEqual('test');

                /*jshint newcap: false */
                expect(ParlayStore("items").get("test").data).toEqual({
                    parlayItem: {
                        $index: 10,
                        active_tab_index: 10
                    }
                });

                ParlayItemPersistence.remove("parlayItem", "$index");

                $scope.$index = 20;
                $scope.active_tab_index = 20;

                ParlayItemPersistence.store("test");

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

                expect(ParlayItemPersistence.collectAll()).toEqual({});

                $scope.$index1 = 10;
                $scope.active_tab_index1 = 10;

                ParlayItemPersistence.monitor('parlayItem1', "$index1", $scope);
                ParlayItemPersistence.monitor('parlayItem1', "active_tab_index1", $scope);

                $scope.$index2 = 10;
                $scope.active_tab_index2 = 10;

                ParlayItemPersistence.monitor('parlayItem2', "$index2", $scope);
                ParlayItemPersistence.monitor('parlayItem2', "active_tab_index2", $scope);

                expect(ParlayItemPersistence.collectAll()).toEqual({
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

                expect(ParlayItemPersistence.collectAll()).toEqual({});

                $scope.$index1 = 10;
                $scope.active_tab_index1 = 10;

                ParlayItemPersistence.monitor('parlayItem1', "$index1", $scope);
                ParlayItemPersistence.monitor('parlayItem1', "active_tab_index1", $scope);

                $scope.$index2 = 10;
                $scope.active_tab_index2 = 10;

                ParlayItemPersistence.monitor('parlayItem2', "$index2", $scope);
                ParlayItemPersistence.monitor('parlayItem2', "active_tab_index2", $scope);

                expect(ParlayItemPersistence.collectDirective('parlayItem1')).toEqual({
                    $index1: 10,
                    active_tab_index1: 10
                });

                expect(ParlayItemPersistence.collectDirective('parlayItem2')).toEqual({
                    $index2: 10,
                    active_tab_index2: 10
                });

            });

            it("gets all registrations for a directive", function () {

                expect(ParlayItemPersistence.getRegistration('parlayItem1')).toEqual([]);

                $scope.$index = 10;

                ParlayItemPersistence.monitor('parlayItem1', "$index", $scope);

                expect(ParlayItemPersistence.getRegistration('parlayItem1')[0]).toEqual(jasmine.objectContaining({
                    $scope: jasmine.any(Object),
                    directive: 'parlayItem1',
                    attribute: '$index'
                }));

            });
    		
        });
        
    });
    
}());