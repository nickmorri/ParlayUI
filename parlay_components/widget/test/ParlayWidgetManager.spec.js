(function () {
    "use strict";

    describe("parlay.widget.manager", function () {
        var ParlaySettings, ParlayStore;

        beforeEach(module("parlay.widget.manager"));

        beforeEach(inject(function (_ParlaySettings_, _ParlayStore_) {
            ParlaySettings = _ParlaySettings_;
            ParlayStore = _ParlayStore_;
            localStorage.clear();

            ParlaySettings.registerDefault("widgets", {editing: true});
            ParlaySettings.restoreDefault("widgets");
        }));

        describe("ParlayWidgetManager", function () {
            var ParlayWidgetManager, $window;

            beforeEach(inject(function (_ParlayWidgetManager_, _$window_) {
                ParlayWidgetManager = _ParlayWidgetManager_;
                $window = _$window_;
            }));

            it("initializes", function () {
                expect(ParlayWidgetManager.saved_workspaces).toEqual([]);
                expect(ParlayWidgetManager.active_widgets).toEqual([]);
                expect(ParlayWidgetManager.editing).toBeTruthy();
            });

            it("toggles editing", function () {
                expect(ParlaySettings.get("widgets").editing).toBeTruthy();
                expect(ParlayWidgetManager.editing).toBeTruthy();
                ParlayWidgetManager.toggleEditing();
                expect(ParlaySettings.get("widgets").editing).toBeFalsy();
                expect(ParlayWidgetManager.editing).toBeFalsy();
            });

            it("adds widget", function () {
                expect(ParlayWidgetManager.getActiveWidgets()).toEqual([]);
                ParlayWidgetManager.add();
                expect(ParlayWidgetManager.getActiveWidgets()).toEqual([{uid: 0}]);
                ParlayWidgetManager.add();
                expect(ParlayWidgetManager.getActiveWidgets()).toEqual([{uid: 0}, {uid: 1}]);
            });

            it("removes widget", function () {
                expect(ParlayWidgetManager.getActiveWidgets()).toEqual([]);
                ParlayWidgetManager.add();
                expect(ParlayWidgetManager.getActiveWidgets()).toEqual([{uid: 0}]);
                ParlayWidgetManager.remove(0);
                expect(ParlayWidgetManager.getActiveWidgets()).toEqual([]);

            });

            it("duplicates widget", function () {
                expect(ParlayWidgetManager.getActiveWidgets()).toEqual([]);
                ParlayWidgetManager.add();
                expect(ParlayWidgetManager.getActiveWidgets()).toEqual([{uid: 0}]);
                ParlayWidgetManager.duplicate(0);
                expect(ParlayWidgetManager.getActiveWidgets()).toEqual([{uid: 0}, {uid: 1}]);
            });

            it("has active widgets", function () {
                expect(ParlayWidgetManager.hasActiveWidgets()).toBeFalsy();
            });

            it("counts active widgets", function () {
                expect(ParlayWidgetManager.countActive()).toBe(0);
            });

            it("clears active widgets", function () {
                var ref = ParlayWidgetManager.getActiveWidgets();
                ParlayWidgetManager.clearActive();
                expect(ParlayWidgetManager.getActiveWidgets()).not.toBe(ref);
            });

            it("gets saved", function () {
                expect(ParlayWidgetManager.getSaved()).toEqual([]);
            });

            it("gets autosaved", function () {
                expect(ParlayWidgetManager.getAutosave()).toBeUndefined();
            });

            it("saves entry", function () {
                expect(ParlayWidgetManager.getSaved()).toEqual([]);
                ParlayWidgetManager.saveEntry({name: "test", data: []});
                expect(ParlayWidgetManager.getSaved()).toEqual([{name: "test", data: [], count: 0, timestamp: jasmine.any(Date)}]);
            });

            it("loads entry", function () {
                expect(ParlayWidgetManager.getActiveWidgets()).toEqual([]);
                ParlayWidgetManager.loadEntry({name: "test", data: [{}], timestamp: new Date(), count: 0});
                expect(ParlayWidgetManager.getActiveWidgets()).toEqual([{}]);
            });

            it("deletes entry", function () {
                expect(ParlayWidgetManager.getSaved()).toEqual([]);
                ParlayWidgetManager.saveEntry({name: "test", data: []});
                expect(ParlayWidgetManager.getSaved()).toEqual([{name: "test", data: [], count: 0, timestamp: jasmine.any(Date)}]);
                ParlayWidgetManager.deleteEntry("test");
                expect(ParlayWidgetManager.getSaved()).toEqual([]);
            });

            it("clears saved", function () {
                expect(ParlayWidgetManager.getSaved()).toEqual([]);
                ParlayWidgetManager.saveEntry({name: "test1", data: []});
                ParlayWidgetManager.saveEntry({name: "test2", data: []});
                expect(ParlayWidgetManager.getSaved()).toEqual([
                    {name: "test2", data: [], count: 0, timestamp: jasmine.any(Date)},
                    {name: "test1", data: [], count: 0, timestamp: jasmine.any(Date)}
                ]);
                ParlayWidgetManager.clearSaved();
                expect(ParlayWidgetManager.getSaved()).toEqual([]);
            });

            it("gets workspaces", function () {
                expect(ParlayWidgetManager.getWorkspaces()).toEqual([]);
                ParlayWidgetManager.saveEntry({name: "test", data: []});
                expect(ParlayWidgetManager.getWorkspaces()).toEqual([{name: "test", data: [], count: 0, timestamp: jasmine.any(Date)}]);
            });

            it("exports", function () {
                ParlayWidgetManager.saveEntry({name: "test", data: []});
                expect(ParlayWidgetManager.export()).toEqual({ "widgets[test]": { name: 'test', data: '[]', count: 0, timestamp: jasmine.any(String) } });
            });

            it("imports", function () {
                ParlayWidgetManager.import(JSON.stringify({ "widgets[test]": {name: 'test', data: '[]', count: 0, timestamp: jasmine.any(String)}}));
                expect(ParlayWidgetManager.getWorkspaces()).toEqual([{name: "test", data: [], count: 0, timestamp: jasmine.any(Date)}]);
            });

            it("handles autosave", function () {
                ParlayWidgetManager.add();
                expect(ParlayWidgetManager.getAutosave()).toBeUndefined();
                ParlayWidgetManager.autoSave();
                expect(ParlayWidgetManager.getAutosave()).toEqual({name: 'AutoSave', data: [{ uid: 0 }], autosave: true, count: 1, timestamp: jasmine.any(Date)});
            });

        });

    });

}());