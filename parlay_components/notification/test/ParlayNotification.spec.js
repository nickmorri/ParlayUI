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

                var history_item = ParlayNotificationHistory.get()[0];

                expect(history_item.time).toEqual(base);
                expect(history_item.contents).toEqual("hey");
                expect(history_item.action).toEqual(jasmine.any(Function));
            });

            it("clears history", function () {
                expect(ParlayNotificationHistory.get()).toEqual([]);
                var base = new Date();
                jasmine.clock().mockDate(base);
                ParlayNotificationHistory.add("hey", function () {});
                var history_item = ParlayNotificationHistory.get()[0];

                expect(history_item.time).toEqual(base);
                expect(history_item.contents).toEqual("hey");
                expect(history_item.action).toEqual(jasmine.any(Function));
                
                ParlayNotificationHistory.clear();
                expect(ParlayNotificationHistory.get()).toEqual([]);
            });

        });

    });

}());