(function () {
    'use strict';

    describe('parlay.notification.error', function() {
        var ParlayErrorDialog, ParlayNotificationHistory, $mdDialog;

        beforeEach(module('parlay.notification.error'));

        beforeEach(inject(function(_ParlayErrorDialog_, _ParlayNotificationHistory_, _$mdDialog_) {
            ParlayErrorDialog = _ParlayErrorDialog_;
            ParlayNotificationHistory = _ParlayNotificationHistory_;
            $mdDialog = _$mdDialog_;
        }));

        describe("ParlayErrorDialog", function () {

            it("show", function () {
                spyOn(ParlayNotificationHistory, "add");
                spyOn($mdDialog, "show");

                ParlayErrorDialog.show("Test", "An arbitrarily generated error message.", {});

                expect(ParlayNotificationHistory.add).toHaveBeenCalled();
                expect($mdDialog.show).toHaveBeenCalled();
            });

        });

        describe("ParlayErrorDialogController", function () {
            var ctrl;

            beforeEach(inject(function ($controller, $rootScope) {
                ctrl = $controller("ParlayErrorDialogController", {$scope: $rootScope.$new()});
            }));

            it("has correct initial state", function () {
                expect(ctrl.more_hidden).toBeTruthy();
            });

            it("toggles visiblity", function() {
                expect(ctrl.more_hidden).toBeTruthy();
                ctrl.toggleMore();
                expect(ctrl.more_hidden).toBeFalsy();
                ctrl.toggleMore();
                expect(ctrl.more_hidden).toBeTruthy();
            });

        });

    });

}());