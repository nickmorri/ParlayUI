(function () {
    "use strict";

    var module_dependencies = ["parlay.widget.manager"];

    angular
        .module("parlay.widget.controller", module_dependencies)
        .controller("ParlayWidgetController", ParlayWidgetController)
        .directive("parlayEmptyWidgetsWorkspacePlaceholder", ParlayEmptyWidgetsWorkspacePlaceholder);

    ParlayWidgetController.$inject = ["ParlayWidgetManager"];
    /**
     * Controller for the widget workspace.
     * @constructor module:ParlayWidget:ParlayWidgetController
     * @param ParlayWidgetManager
     */
    function ParlayWidgetController (ParlayWidgetManager) {

        var ctrl = this;

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

        /**
         * Requests all active widget configuration Objects from the ParlayWidgetManager.
         * @member module:ParlayWidget:ParlayWidgetController#getActiveWidgets
         * @public
         * @returns {Array}
         */
        function getActiveWidgets () {
            return ParlayWidgetManager.getActiveWidgets();
        }

        /**
         * True if any widgets are active, false otherwise.
         * @member module:ParlayWidget:ParlayWidgetController#hasWidgets
         * @public
         * @returns {Boolean}
         */
        function hasWidgets () {
            return ParlayWidgetManager.hasActiveWidgets();
        }

        /**
         * Requests the ParlayWidgetManager to insert another widget configuration Object.
         * @member module:ParlayWidget:ParlayWidgetController#add
         * @public
         */
        function add () {
            ParlayWidgetManager.add();
        }

        /**
         * Requests the ParlayWidgetManager to remove the widget configuration Object corresponding to the given uid.
         * @member module:ParlayWidget:ParlayWidgetController#remove
         * @public
         * @param {Number} uid - Unique ID that identifies a single widget configuration Object.
         */
        function remove (uid) {
            ParlayWidgetManager.remove(uid);
        }

        /**
         * Requests the ParlayWidgetManager to duplicate the widget configuration Object corresponding to the given uid.
         * @member module:ParlayWidget:ParlayWidgetController#duplicate
         * @public
         * @param {Number} uid - Unique ID that identifies a single widget configuration Object.
         */
        function duplicate (uid) {
            ParlayWidgetManager.duplicate(uid);
        }
        
    }

    /* istanbul ignore next */
    function ParlayEmptyWidgetsWorkspacePlaceholder () {
        return {
            templateUrl: '../parlay_components/widget/directives/parlay-empty-widget-workspace-placeholder.html'
        };
    }

}());