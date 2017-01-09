(function () {
    "use strict";

    var module_dependencies = ["ngMdIcons", "templates-main", "parlay.item.persistence"];

    angular
        .module("parlay.items.card", module_dependencies)
        .directive("parlayItemCard", ParlayItemCard);

    ParlayItemCard.$inject = ["$compile", "ParlayItemPersistence"];
    /**
     * Directive that displays data from a particular ParlayItem.
     * @constructor module:ParlayItem.ParlayItemCard
     * @param {Object} $compile - AngularJS [$compile]{@link https://docs.angularjs.org/api/ng/service/$compile} service
     * used to create a template function used to link scope and template.
     * @param {Object} ParlayItemPersistence - [ParlayItemPersistence]{@link module:ParlayItem.ParlayItemPersistence}
     * service used to persist scope values into local storage.
     */
    function ParlayItemCard ($compile, ParlayItemPersistence) {
        return {
            templateUrl: "../parlay_components/items/directives/parlay-item-card.html",
            link: function (scope, element) {

                // Grab the item reference from the container for convenience of using scope.item.
                scope.uid = scope.container.uid;
                scope.item = scope.container.ref;
                scope.type = "StandardItem";

                // Compile all the toolbar and tab directives.
                compileDirectives();

                // ParlayItemPersistence will restore any values available if the card was duplicated or from a previous
                // session. It will then register them for persistence across sessions.
                var directive_name = "parlayItemCard." + scope.item.id.replace(" ", "_") + "_" + scope.container.uid;
                ParlayItemPersistence.monitor(directive_name, "$index", scope);
                ParlayItemPersistence.monitor(directive_name, "active_tab_index", scope);

                scope.$emit("parlayItemCardLoaded", element);

                /**
                 * Compiles the toolbar set on the item.
                 * @member module:ParlayItem.ParlayItemCard#compileToolbar
                 * @private
                 * @param {Array} directives - Array of directive name strings.
                 */
                function compileToolbar (directives) {
                    // Locate toolbar where we are going to insert dynamic directives.
                    var toolbar = element[0].querySelector("div.md-toolbar-tools");

                    directives.map(function (directive) {
                        return "<" + directive.snakeCase() + " flex item='item' layout-fill layout='row' layout-align='space-between center'></" + directive.snakeCase() + ">";
                    }).forEach(function (directive_string) {
                        toolbar.insertBefore($compile(directive_string)(scope)[0], toolbar.firstChild);
                    });
                }

                /**
                 * Compiles the tabs set on the item.
                 * @member module:ParlayItem.ParlayItemCard#compileTabs
                 * @private
                 * @param {Array} directives - Array of directive name strings.
                 */
                function compileTabs (directives) {
                    // Locate tabs where we are going to insert dynamic directives.
                    var tabs = element[0].querySelector("md-tabs");

                    directives.map(function (directive) {
                        return "<" + directive.snakeCase() + " item='item'></" + directive.snakeCase() + ">";
                    }).forEach(function (directive_string) {
                        tabs.appendChild($compile(directive_string)(scope)[0]);
                    });
                }

                /**
                 * Compile each directive.
                 * @member module:ParlayItem.ParlayItemCard#compileDirectives
                 * @private
                 */
                function compileDirectives () {
                    var directives = scope.item.getDirectives();
                    Object.keys(directives).forEach(function (target) {
                        directives[target].forEach(function (directive) {
                            if (target === "tabs") {
                                compileTabs([directive]);
                            }
                            else if (target === "toolbar") {
                                compileToolbar([directive]);
                            }
                        });
                    });
                }
            }
        };
    }
}());