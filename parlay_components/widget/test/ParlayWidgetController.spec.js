(function () {
    "use strict";

    describe("parlay.widget.controller", function () {

        beforeEach(module("parlay.widget.controller"));
        beforeEach(module("parlay.settings"));

        beforeEach(inject(function (_ParlaySettings_) {
            _ParlaySettings_.registerDefault("widgets", {editing: true});
            _ParlaySettings_.restoreDefault("widgets");
        }));

        describe("ParlayWidgetController", function () {
            var controller, manager;

            beforeEach(inject(function (_$controller_, _ParlayWidgetManager_) {
                manager = _ParlayWidgetManager_;
                controller = _$controller_("ParlayWidgetController", {ParlayWidgetManager: manager});
            }));

            it("editing", function () {
                expect(controller.editing).toBe(manager.editing);
            });

            it("getActiveWidgets", function () {
                spyOn(manager, "getActiveWidgets");
                expect(controller.getActiveWidgets()).toBe(manager.getActiveWidgets());
                expect(manager.getActiveWidgets).toHaveBeenCalled();
            });
            
            it("hasWidgets", function () {
                spyOn(manager, "hasActiveWidgets");
                expect(controller.hasWidgets()).toBe(manager.hasActiveWidgets());
                expect(manager.hasActiveWidgets).toHaveBeenCalled();
            });
            
            it("add", function () {
                spyOn(manager, "add");
                controller.add();
                expect(manager.add).toHaveBeenCalled();
            });
            
            it("remove", function () {
                spyOn(manager, "remove");
                controller.remove(0);
                expect(manager.remove).toHaveBeenCalledWith(0);
            });
            
            it("duplicate", function () {
                spyOn(manager, "duplicate");
                controller.duplicate(0);
                expect(manager.duplicate).toHaveBeenCalledWith(0);
            });

        });

    });

}());