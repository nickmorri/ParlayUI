(function () {
    "use strict";

    var module_dependencies = ["ngMaterial", "ngMessages", "ngMdIcons", "templates-main", "parlay.item.persistence", "parlay.utility"];

    angular
        .module("parlay.items.item.card", module_dependencies)
        .directive("parlayItemCard", ParlayItemCard);

    ParlayItemCard.$inject = ["$compile", "ParlayItemPersistence"];
    /**
     * Directive that displays data from a particular ParlayItem.
     * @constructor module:ParlayItem.ParlayItemCard
     * @param {Object} $compile - AngularJS service used to create a template function used to link scope and template.
     * @param {Object} ParlayItemPersistence - Parlay service used to persist scope values into local storage.
     */
    function ParlayItemCard ($compile, ParlayItemPersistence) {
        return {
            templateUrl: "../parlay_components/items/directives/parlay-item-card.html",
            link: function (scope, element) {

                // Setup drag handlers for ParlayItemCard drag and drop rearrange functionality.
                setupDragHandlers(element, scope);

                // Grab the item reference from the container for convenience of using scope.item.
                scope.item = scope.container.ref;

                // Compile all the toolbar and tab directives.
                compileDirectives();

                // ParlayItemPersistence will restore any values available if the card was duplicated or from a previous
                // session. It will then register them for persistence across sessions.
                var directive_name = "parlayItemCard." + scope.item.name.replace(" ", "_") + "_" + scope.container.uid;
                ParlayItemPersistence.monitor(directive_name, "$index", scope);
                ParlayItemPersistence.monitor(directive_name, "active_tab_index", scope);

                /**
                 * Setup drag event handlers to allow cards to by rearranged by dragging.
                 * @member module:ParlayItem.ParlayItemCard#setupDragHandlers
                 * @private
                 * @param {HTMLElement} element - ParlayItemCard HTML element.
                 * @param {Object} scope - AngularJS $scope Object.
                 */
                function setupDragHandlers (element, scope) {

                    // Fired when drag event begins on a ParlayItemCard.
                    element.on('dragstart', function (event) {
                        // Set the card index in the event.
                        event.dataTransfer.setData("text/plain", scope.$index);

                        // Specify the type of drop zone that can accept the event.
                        event.dataTransfer.effectAllowed = "link";
                    });

                    // Fired as a ParlayItemCard is dragged over a ParlayItemCard.
                    element.on('dragover', function (event) {
                        // Specify the type of draggable this element can accept.
                        event.dataTransfer.dropEffect = "link";

                        // Indicates the element is a valid drop zone.
                        event.preventDefault();
                        event.stopPropagation();
                        return false;
                    });

                    // Fired when a ParlayItemCard is dropped on a ParlayItemCard.
                    element.on('drop', function (event) {
                        // Indices of the source and destination ParlayItemCard of the drag event.
                        var this_index = scope.$index;
                        var that_index = event.dataTransfer.getData("text/plain");

                        // Swap the ParlayItemCards.
                        scope.$apply(function () {
                            scope.itemCtrl.swap(this_index, that_index);
                        });

                    });

                }

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