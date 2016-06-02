(function () {
    "use strict";

    var module_name = "promenade.items.standarditem.property";
    var module_dependencies = [];

    // Register module as [PromenadeStandardItem]{@link module:PromenadeStandardItem.PromenadeStandardItem} dependency.
    standard_item_dependencies.push(module_name);

    angular
        .module(module_name, module_dependencies)
        .controller("PromenadeStandardItemCardPropertyTabController", PromenadeStandardItemCardPropertyTabController)
        .directive("promenadeStandardItemCardProperty", PromenadeStandardItemCardProperty);

    PromenadeStandardItemCardPropertyTabController.$inject = ["$q"];
    /**
     * Controller constructor for the property tab.
     * @constructor module:PromenadeStandardItem.PromenadeStandardItemCardPropertyTabController
     * @param {Object} $q - AngularJS $q service.
     */
    function PromenadeStandardItemCardPropertyTabController ($q) {
        
        var ctrl = this;

        /**
         * Controller state attribute, true if a request has been sent but the response has not been received.
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardPropertyTabController#waiting
         * @public
         * @type {boolean}
         */
        ctrl.waiting = false;

        // Attach methods to controller.
        ctrl.hasProperties = hasProperties;
        ctrl.getAllProperties = getAllProperties;
        ctrl.setAllProperties = setAllProperties;

        /**
         * True if the item has any properties, false otherwise.
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardPropertyTabController#hasProperties
         * @public
         * @returns {Boolean}
         */
        function hasProperties  () {
            return Object.keys(ctrl.item.properties).length > 0;
        }

        /**
         * Gets all property values from an item.
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardPropertyTabController#getAllProperties
         * @public
         * @returns {$q.deferred.Promise} - Resolved when all properties have returned a response.
         */
        function getAllProperties  () {
            ctrl.waiting = true;
            return $q.all(Object.keys(ctrl.item.properties).map(function (key) {
                return ctrl.item.properties[key].get();
            }, ctrl)).then(function () {
                ctrl.waiting = false;
            });
        }

        /**
         * Sets all property values from an item.
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardPropertyTabController#getAllProperties
         * @public
         * @returns {$q.deferred.Promise} - Resolved when all properties have returned a response. 
         */
        function setAllProperties () {
            ctrl.waiting = true;
            return $q.all(Object.keys(ctrl.item.properties).map(function (key) {
                return ctrl.item.properties[key].set();
            }, ctrl)).then(function () {
                ctrl.waiting = false;
            });
        }
        
    }

    /**
     * Directive constructor for PromenadeStandardItemCardProperty.
     * @returns {Object} - AngularJS directive definition.
     */
    /* istanbul ignore next */
    function PromenadeStandardItemCardProperty() {
        return {
            scope: {
                item: "="
            },
            templateUrl: "../vendor_components/promenade/items/directives/promenade-standard-item-card-property.html",
            controller: "PromenadeStandardItemCardPropertyTabController",
            controllerAs: "ctrl",
            bindToController: true
        };
    }

}());