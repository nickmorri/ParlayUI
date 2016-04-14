(function () {
    "use strict";

    describe("promenade.items.standarditem.log", function() {

        beforeEach(module("promenade.items.standarditem.log"));

        describe("PromenadeStandardItemLogController", function () {
            var $scope, controller, ParlayPersistence;

            beforeEach(inject(function ($rootScope, $controller, _ParlayPersistence_) {
                $scope = $rootScope.$new();
                $scope.container = {ref: {name: "test"}, uid: 100};
                ParlayPersistence = _ParlayPersistence_;
                spyOn(ParlayPersistence, "monitor").and.callThrough();
                controller = $controller("PromenadeStandardItemCardLogTabController", {$scope: $scope});
                controller.item = {
                    log: [{
                        TOPICS: {to: "me",from: "you"},
                        CONTENTS: {data: 10,rate: 50}
                    }, {
                        TOPICS: {to: "him",from: "her"},
                        CONTENTS: {data: 10,rate: 100}
                    }]
                };
            }));

            it("has initial values", function () {
                expect(controller.filter_text).toBe(null);
                expect(ParlayPersistence.monitor).toHaveBeenCalledWith("parlayItemCard.test_100", "filter_text", $scope);
            });

            it("getLog", function () {
                expect(controller.getLog()).toEqual([{
                    TOPICS: {to: "me",from: "you"},
                    CONTENTS: {data: 10,rate: 50}
                }, {
                    TOPICS: {to: "him",from: "her"},
                    CONTENTS: {data: 10,rate: 100}
                }]);
            });

            it("getFilteredLog", function () {
                expect(controller.getFilteredLog("him")).toEqual([{
                    TOPICS: {to: "him",from: "her"},
                    CONTENTS: {data: 10,rate: 100}
                }]);
                expect(controller.getFilteredLog("me")).toEqual([{
                    TOPICS: {to: "me",from: "you"},
                    CONTENTS: {data: 10,rate: 50}
                }]);
                expect(controller.getFilteredLog("10")).toEqual([{
                    TOPICS: {to: "me",from: "you"},
                    CONTENTS: {data: 10,rate: 50}
                }, {
                    TOPICS: {to: "him",from: "her"},
                    CONTENTS: {data: 10,rate: 100}
                }]);
                expect(controller.getFilteredLog()).toEqual([{
                    TOPICS: {to: "me",from: "you"},
                    CONTENTS: {data: 10,rate: 50}
                }, {
                    TOPICS: {to: "him",from: "her"},
                    CONTENTS: {data: 10,rate: 100}
                }]);
            });

        });

        describe("PromenadeStandardItemCardLogItemController", function () {
            var $scope, controller, ParlayNotification;

            beforeEach(inject(function ($rootScope, $controller, _ParlayNotification_) {
                $scope = $rootScope.$new();
                ParlayNotification = _ParlayNotification_;
                controller = $controller("PromenadeStandardItemCardLogItemController", {$scope: $scope});
                controller.message = {TOPICS: {to: "me",from: "you"},CONTENTS: {data: 10,rate: 100}};
            }));

            it("copy", function () {
                spyOn(ParlayNotification, "show");
                controller.copy();
                expect(ParlayNotification.show).toHaveBeenCalledWith({content: "Copy failed. Check browser compatibility."});
            });

        });

    });

}());