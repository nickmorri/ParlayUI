(function () {
    'use strict';

    describe('parlay.settings', function () {

        beforeEach(module('parlay.settings'));

        describe("ParlaySettings", function () {
            var ParlaySettings, ParlayStore;

            beforeEach(inject(function (_ParlaySettings_, _ParlayStore_) {
                ParlaySettings = _ParlaySettings_;
                ParlayStore = _ParlayStore_("settings");
            }));

            afterEach(function () {
                ParlayStore.clear();
            });

            it("gets", function () {
                ParlayStore.set("test", {data: 10});
                expect(ParlaySettings.get("test")).toEqual({data: 10});
            });

            it("has", function () {
                expect(ParlaySettings.has("test")).toBeFalsy();
                ParlayStore.set("test", {data: 10});
                expect(ParlaySettings.has("test")).toBeTruthy();
            });

            it("sets", function () {
                ParlayStore.set("test", {data: 10});
                expect(ParlaySettings.get("test")).toEqual({data: 10});
                ParlaySettings.set("test", {data: 20});
                expect(ParlaySettings.get("test")).toEqual({data: 20});
            });

            it("registers defaults", function () {
                ParlaySettings.registerDefault("test", {data:5});
                expect(ParlaySettings.defaults["test"]).toEqual({data:5});
            });

            it("restores defaults", function () {
                ParlaySettings.registerDefault("test", {data:5});
                expect(ParlaySettings.has("test")).toBeFalsy();
                ParlayStore.set("test", {data: 10});
                expect(ParlaySettings.get("test")).toEqual({data: 10});
                ParlaySettings.restoreDefault("test");
                expect(ParlaySettings.get("test")).toEqual({data: 5});
            });

        });

    });

}());