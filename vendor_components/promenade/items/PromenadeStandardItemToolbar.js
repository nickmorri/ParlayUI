(function () {
    "use strict";

    var module_dependencies = [];

    angular.module("promenade.items.standarditem.toolbar", module_dependencies)
        .directive("promenadeStandardItemCardToolbar", PromenadeStandardItemCardToolbar);

    /* istanbul ignore next */
    /**
     * Toolbar directive for use in a PromenadeStandardItem.
     * @constructor module:PromenadeStandardItem.PromenadeStandardItemToolbar
     *
     * @example
     *
     * <promenade-standard-item-card-toolbar item="item"></promenade-standard-item-card-toolbar>
     *
     * @returns {Object} - AngularJS directive definition Object.
     */
    function PromenadeStandardItemCardToolbar () {
        return {
            restrict: "E",
            scope: {
                item: "="
            },
            template: '<div>{{::item.name}}</div>' +
            '<div class="md-subhead" layout="column">ID: {{::item.id}}</div>'
        };
    }

}());