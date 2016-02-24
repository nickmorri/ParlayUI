(function () {
    "use strict";

    describe("parlay.items.controller", function() {

        beforeEach(module("parlay.items.controller"));

        describe("ParlayItemController", function () {
            var scope, ParlayItemController, ParlayItemManager;

            beforeEach(module("mock.parlay.items.manager"));

            beforeEach(inject(function($rootScope, $controller, _ParlayItemManager_) {
                ParlayItemManager = _ParlayItemManager_;
                scope = $rootScope.$new();
                ParlayItemController = $controller("ParlayItemController", {$scope: scope});
            }));

            describe("accessors", function () {

                it("checks for items", function () {
                    expect(ParlayItemController.hasItems()).toBeFalsy();
                });

            });

            describe("workspace management", function() {

                it("reorders items", function () {
                    spyOn(ParlayItemManager, "reorder");
                    ParlayItemController.reorder("1", 1);
                    expect(ParlayItemManager.reorder).toHaveBeenCalledWith(1,1);
                });

                it("duplicates items", function () {
                    spyOn(ParlayItemManager, "duplicateItem");
                    ParlayItemController.duplicate(1, 100);
                    expect(ParlayItemManager.duplicateItem).toHaveBeenCalledWith(1, 100);
                });

                it("deactivates items", function () {
                    spyOn(ParlayItemManager, "deactivateItem");
                    ParlayItemController.deactivate(1);
                    expect(ParlayItemManager.deactivateItem).toHaveBeenCalledWith(1);
                });

            });

            describe("item filtering", function () {

                it("calls ParlayItemManager", function () {
                    expect(ParlayItemController.filterItems()).toEqual([]);
                });

            });

        });

        describe("ParlayEmptyWorkspacePlaceholderController", function () {
            var ctrl;

            beforeEach(inject(function($rootScope, $controller) {
                ctrl = $controller("ParlayEmptyWorkspacePlaceholderController", {scope: $rootScope.$new()});
            }));

            it("focus targets correct element", function () {

                spyOn(document, "getElementById");

                ctrl.focusItemSearch();
                expect(document.getElementById).toHaveBeenCalledWith("item-search");
            });

        });

    });

}());