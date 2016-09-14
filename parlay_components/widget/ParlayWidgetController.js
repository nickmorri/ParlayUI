(function () {
    "use strict";

    var module_dependencies = ["parlay.widget.manager", "parlay.data"];

    angular
        .module("parlay.widget.controller", module_dependencies)
        .controller("ParlayWidgetController", ParlayWidgetController)
        .directive("parlayEmptyWidgetsWorkspacePlaceholder", ParlayEmptyWidgetsWorkspacePlaceholder);

    ParlayWidgetController.$inject = ["ParlayWidgetManager", "ParlayData"];
    /**
     * Controller for the widget workspace.
     * @constructor module:ParlayWidget.ParlayWidgetController
     * @param {ParlayWidgetManager} ParlayWidgetManager - [ParlayWidgetManager]{@link module:ParlayWidget.ParlayWidgetManager} service.
     */
    function ParlayWidgetController (ParlayWidgetManager, ParlayData) {

        var ctrl = this;
        var widget_by_name = {};
        ParlayData.set("widgets_scope_by_name", widget_by_name);

        // Define editing property on the controller to make it more easily accessible by child scopes.
        Object.defineProperty(ctrl, "editing", {
            get: function () {
                return ParlayWidgetManager.editing;
            }
        });

        // Attach methods to controller.
        ctrl.getActiveWidgets = getActiveWidgets;
        ctrl.hasWidgets = hasWidgets;
        ctrl.add = add;
        ctrl.remove = remove;
        ctrl.duplicate = duplicate;
        ctrl.registerScope = registerScope;

        /**
         * Requests all active widget configuration Objects from the
         * [ParlayWidgetManager]{@link module:ParlayWidget.ParlayWidgetManager}.
         * @member module:ParlayWidget.ParlayWidgetController#getActiveWidgets
         * @public
         * @returns {Array}
         */
        function getActiveWidgets () {
            return ParlayWidgetManager.getActiveWidgets();
        }

        /**
         * True if any widgets are active, false otherwise.
         * @member module:ParlayWidget.ParlayWidgetController#hasWidgets
         * @public
         * @returns {Boolean}
         */
        function hasWidgets () {
            return ParlayWidgetManager.hasActiveWidgets();
        }

        /**
         * Requests the [ParlayWidgetManager]{@link module:ParlayWidget.ParlayWidgetManager} to insert another widget
         * configuration Object.
         * @member module:ParlayWidget.ParlayWidgetController#add
         * @public
         */
        function add () {
            ParlayWidgetManager.add();
        }

        /**
         * Requests the [ParlayWidgetManager]{@link module:ParlayWidget.ParlayWidgetManager} to remove the widget
         * configuration Object corresponding to the given uid.
         * @member module:ParlayWidget.ParlayWidgetController#remove
         * @public
         * @param {Number} uid - Unique ID that identifies a single widget configuration Object.
         */
        function remove (uid) {
            ParlayWidgetManager.remove(uid);
        }

        /**
         * Requests the [ParlayWidgetManager]{@link module:ParlayWidget.ParlayWidgetManager} to duplicate the widget
         * configuration Object corresponding to the given uid.
         * @member module:ParlayWidget.ParlayWidgetController#duplicate
         * @public
         * @param {Number} uid - Unique ID that identifies a single widget configuration Object.
         */
        function duplicate (uid) {
            ParlayWidgetManager.duplicate(uid);
        }

        function registerScope(new_widget_name, scope)
        {
            if(new_widget_name === undefined) new_widget_name = "UNKNOWN NAME";
            console.log(scope);
            widget_by_name[new_widget_name] = scope;
            var number = 1; var new_widget_name_base = new_widget_name;
            while(new_widget_name in widget_by_name) new_widget_name = new_widget_name_base + " " + number++;
            widget_by_name[new_widget_name] = scope;
            //registration.widget_name = new_widget_name;
            //TODO Reflect name change in scope?
            return new_widget_name
        }

        /**
         * Rename an element
         * @param widget_uid
         * @param new_widget_name
         * @result the actual chosen name (could be changed for disambiguation)
         */
        function rename_element(old_widget_name,  new_widget_name)
        {
            var scope = widget_by_name[old_widget_name];
            //delete the old reference
            delete widget_by_name[old_widget_name];
            //assign it a new name, but add the uid to disambiguate if it was already taken
            var number = 1; var new_widget_name_base = new_widget_name;
            while(new_widget_name in widget_by_name) new_widget_name = new_widget_name_base + " " + number++;
            widget_by_name[new_widget_name] = scope;
            //registration.widget_name = new_widget_name;
            //TODO Reflect name change in scope?
            return new_widget_name
        }
    }

    /* istanbul ignore next */
    function ParlayEmptyWidgetsWorkspacePlaceholder () {
        return {
            templateUrl: '../parlay_components/widget/directives/parlay-empty-widget-workspace-placeholder.html'
        };
    }

}());