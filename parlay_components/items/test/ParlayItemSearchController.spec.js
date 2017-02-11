(function () {
    "use strict";

    describe("parlay.items.search", function() {

        var ParlaySettings;

        beforeEach(module("parlay.items.search"));
        beforeEach(module("mock.parlay.items.manager"));

        beforeEach(inject(function (_ParlaySettings_) {
            ParlaySettings = _ParlaySettings_;
            ParlaySettings.registerDefault("widgets", {editing: true});
            ParlaySettings.restoreDefault("widgets");
        }));


        describe("ParlayItemSearchController", function () {
            var scope, ParlayItemSearchController, ParlayItemManager, mockSidenav;

            mockSidenav = function () {
                return {
                    isLockedOpen: function () { return true; },
                    close: function () {}
                };
            };

            beforeEach(inject(function ($rootScope, $controller, _ParlayItemManager_) {
                ParlayItemManager = _ParlayItemManager_;
                scope = $rootScope.$new();
                ParlayItemSearchController = $controller("ParlayItemSearchController", {$scope: scope, $mdSidenav: mockSidenav});
            }));

            describe("search state", function () {

                it("selects item", function () {

                    var item = {name: "test", id: 1};

                    scope.search_text = "still here";

                    ParlayItemSearchController.selectItem(item);

                    expect(scope.selected_item).toBe(null);
                    expect(scope.search_text).toBe(null);

                });

                it("handles undefined item selection", function () {
                    scope.search_text = "still here";

                    var item = null;

                    ParlayItemSearchController.selectItem(item);

                    expect(scope.search_text).toBe("still here");
                });

            });

            describe("searching", function () {

                it("filters correctly", function () {
                    expect(ParlayItemSearchController.querySearch("test").length).toBe(2);
                });

                it("defaults to no filter if query not provided", function () {
                    expect(ParlayItemSearchController.querySearch("").length).toBe(3);
                });
            });
        });
    });
}());