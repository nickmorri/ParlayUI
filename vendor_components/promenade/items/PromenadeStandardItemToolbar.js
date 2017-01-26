(function () {
    "use strict";

    var module_dependencies = [];

    angular.module("promenade.items.standarditem.toolbar", module_dependencies)
        .directive("promenadeStandardItemCardToolbar", PromenadeStandardItemCardToolbar);

    /* istanbul ignore next */
    /**
     * Toolbar directive for use in a [PromenadeStandardItem]{@link module:PromenadeStandardItem.PromenadeStandardItem}.
     * @constructor module:PromenadeStandardItem.PromenadeStandardItemToolbar
     *
     * @example
     * <promenade-standard-item-card-toolbar item="item"></promenade-standard-item-card-toolbar>
     */
    function PromenadeStandardItemCardToolbar () {
        return {
            restrict: "E",
            scope: {
                item: "="
            },
            templateUrl: '../vendor_components/promenade/items/directives/promenade-standard-item-card-toolbar.html'
        };
    }

}());