(function () {
    "use strict";

    var module_dependencies = [];

    angular.module("promenade.items.standarditem.toolbar", module_dependencies)
        .directive("promenadeStandardItemCardToolbar", PromenadeStandardItemCardToolbar);

    /* istanbul ignore next */
    function PromenadeStandardItemCardToolbar() {
        return {
            scope: {
                item: "="
            },
            template: '<div>{{::item.name}}</div>' +
            '<div class="md-subhead" layout="column">ID: {{::item.id}}</div>'
        };
    }

}());