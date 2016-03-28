(function () {
    'use strict';

    describe('parlay.notification', function() {
        var ParlayNotificationHistory, ParlayNotification;

        beforeEach(module('parlay.notification'));

        beforeEach(inject(function(_ParlayNotificationHistory_, _ParlayNotification_) {
            ParlayNotificationHistory = _ParlayNotificationHistory_;
            ParlayNotification = _ParlayNotification_;
        }));

        describe("ParlayNotificationHistory", function () {

            it("emtpy initially", function () {
                expect(ParlayNotificationHistory.get()).toEqual([]);
            });

            it("adds item", function () {
                expect(ParlayNotificationHistory.get()).toEqual([]);
                var base = new Date();
                jasmine.clock().mockDate(base);
                ParlayNotificationHistory.add("hey", function () {});
                expect(ParlayNotificationHistory.get()).toEqual([{time: base, contents: "hey", action:jasmine.any(Function)}]);
            });

            it("clears histroy", function () {
                expect(ParlayNotificationHistory.get()).toEqual([]);
                var base = new Date();
                jasmine.clock().mockDate(base);
                ParlayNotificationHistory.add("hey", function () {});
                expect(ParlayNotificationHistory.get()).toEqual([{time: base, contents: "hey", action:jasmine.any(Function)}]);
                ParlayNotificationHistory.clear();
                expect(ParlayNotificationHistory.get()).toEqual([]);
            });

        });

        describe("ParlayNotification", function () {

            it("shows a notification", function () {});

            it("shows a progress bar", function () {});

        });

    });

}());