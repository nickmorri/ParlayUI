(function () {
    "use strict";

    var module_dependencies = [];

    angular
        .module("parlay.widget.collection", module_dependencies)
        .factory("ParlayWidgetCollection", ParlayWidgetCollectionFactory);

    function ParlayWidgetCollectionFactory() {

        /**
         * ParlayWidgetCollection service for collecting widget directives. As directives are created they should
         * register themselves with the ParlayWidgetCollection so that other services and controllers can query a
         * single service to discover all available directives.
         *
         * @constructor module:ParlayWidget.ParlayWidgetCollection
         */

        function ParlayWidgetCollection() {
            this.available_widgets = [];
        }

        /**
         * Records the given directive and it's type.
         * @member module:ParlayWidget.ParlayWidgetCollection#registerWidget
         * @public
         * @param {String} directive_name - Name that the directive registration provides.
         * @param {String} widget_type - Type that the directive registration provides.
         * @param {Array} configuration_tabs - Array containing configuration tab directive definitions provided by widget.
         */
        ParlayWidgetCollection.prototype.registerWidget = function (directive_name, widget_type, configuration_tabs) {
            this.available_widgets.push({name: directive_name, type: widget_type, configuration_tabs: configuration_tabs});
        };

        /**
         * Records the Array of directives.
         * @member module:ParlayWidget.ParlayWidgetCollection#registerWidgets
         * @public
         * @param {Array} widgets - Array of directives to be recorded.
         */
        ParlayWidgetCollection.prototype.registerWidgets = function (widgets) {
            widgets.forEach(function (container) {
                this.registerWidget(container.directive_name, container.widget_type, container.configuration_tabs);
            }, this);
        };

        /**
         * Returns all previously registered widgets.
         * @member module:ParlayWidget.ParlayWidgetCollection#getAvailableWidgets
         * @public
         * @returns {Array} - Array of registered widgets.
         */
        ParlayWidgetCollection.prototype.getAvailableWidgets = function () {
            return this.available_widgets;
        };

        return new ParlayWidgetCollection();
    }

}());