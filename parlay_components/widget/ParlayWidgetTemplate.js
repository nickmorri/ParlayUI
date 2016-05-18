(function () {
    "use strict";

    var module_dependencies = [];

    angular
        .module("parlay.widget.template", module_dependencies)
        .factory("ParlayWidgetTemplate", ParlayWidgetTemplateFactory);

    function ParlayWidgetTemplateFactory () {

        /**
         * @service
         * @name ParlayWidgetTemplate
         *
         * @description
         * ParlayWidget utility service for defining widget directives.
         *
         * This utility is intended to reduce the amount of boilerplate required to define a ParlayWidget directive.
         * It is not required for ParlayWidget definition, a more advanced user may choose to define their ParlayWidget
         * directives using the standard AngularJS directive registration.
         *
         * Information on the standard AngularJS directive registration is available in the following URL:
         * https://docs.angularjs.org/guide/directive
         *
         * The return value is a fully configured directive definition Object. This Object is constructed using the values
         * provided by the user in the options parameter given during construction.
         *
         * Any of the standard AngularJS directive definition parameters may be included in the options configuration Object.
         * The standard AngularJS directive definition parameters are described in the following URL:
         * https://docs.angularjs.org/api/ng/provider/$compileProvider#directive
         *
         * @param {Object} options - The following attributes are specific to the ParlayWidgetTemplate:
         *
         *      [optional] A AngularJS directive link function that the user can define for custom behavior.
         *      Custom functionality that interacts with the DOM should be defined here. If integrating a separate JavaScript
         *      library, such as graphing or charting, this is where it should be hooked in.
         *
         *      customLink {Function} (scope, element) :
         *          scope {AngularJS Scope} - Isolated scope of the directive.
         *          element {HTML Element} - HTML element of directive.
         *
         * Examples are provided below detailing the different use cases for the ParlayWidgetTemplate service.
         *
         * @example
         * Basic template only example:
         *
         *      PromenadeWidgetExample.$inject = ["ParlayWidgetTemplate"];
         *      function PromenadeWidgetExample (ParlayWidgetTemplate) {
         *          return new ParlayWidgetTemplate({
         *              templateUrl: "../vendor_components/promenade/widget/directives/promenade-widget-example.html"
         *          });
         *     }
         *
         *
         * @example
         * Advanced custom user-defined link example:
         *
         *      PromenadeWidgetExample.$inject = ["ParlayWidgetTemplate"];
         *      function PromenadeWidgetExample (ParlayWidgetTemplate) {
         *
         *          function customLink (scope, element) {
         *              // Custom user defined logic that should run during link is here.
         *          }
         *
         *          return new ParlayWidgetTemplate({
         *              templateUrl: "../vendor_components/promenade/widget/directives/promenade-widget-example.html",
         *              link: customLink
         *          });
         *
         *      }
         *
         * @returns {Object} - Fully configured AngularJS directive definition Object.
         *
         */

        function ParlayWidgetTemplate(options) {

            var custom_link = options.customLink;
            var scope_defaults = options.scopeDefaults;

            // We don't need the customLink attribute in the directive definition Object.
            if (!!custom_link) {
                delete options.customLink;
            }

            // We don't need the scopeDefaults attribute in the directive definition Object.
            if (!!scope_defaults) {
                delete options.scopeDefaults;
            }

            /**
             * If customLink available, calls the user provided link function during directive linking.
             * Notifies parent that linking is complete.
             * @param scope {AngularJS Scope} - Isolated scope of the directive.
             * @param element {HTML Element} - HTML element of directive.
             * @param attrs {Object} - Key/value pairs of normalized attribute names and their attribute values.
             * @param controller {Object} - The directive's required controller instance or its own controller (if any).
             * @param transcludeFn {Function} - Transclude linking function pre-bound to the correct transclusion scope.
             */
            function link (scope, element, attrs, controller, transcludeFn) {

                // If the user defined a customLink we should call it.
                if (!!custom_link) {
                    custom_link(scope, element, attrs, controller, transcludeFn);
                }

                // If the user defined scope defaults we should assign them.
                if (!scope.options && !!scope_defaults) {
                    scope.options = angular.copy(scope_defaults);
                }

                // ParlayWidgets should notify their parent, ParlayBaseWidget, when they are loaded.
                scope.$emit("parlayWidgetTemplateLoaded");
            }

            /**
             * @attribute {String} restrict - Restricts ParlayWidget constructed using ParlayWidgetTemplate to elements.
             * @attribute {Function} link - Function that is called during directive linking. Specified in the options
             * configuration Object.
             * @attribute {Object} scope - Define the scope bindings for the ParlayWidget.
             *
             *      The bindings specified in the scope attribute correspond to attributes that live in the scope of
             *      ParlayBaseWidget. A brief description is given here. A full explanation is available in ParlayBaseWidget
             *      documentation.
             *
             *      @attribute {Array} items - Items the user selected during widget configuration.
             *      @attribute {Number|String|Object} transformedValue - Result of the transform statement defined during widget configuration.
             *      @attribute {AngularJS Controller} widgetsCtrl - Controller of the widget workspace.
             *      @attribute {Function} edit - Launches the widget configuration dialog.
             *      @attribute {Number} uid - A unique ID assigned to each ParlayWidget, it is used for deletion, duplication and other
             *      bookkeeping activities.
             *
             */

            var template_options = {
                restrict: "E",
                link: link,
                scope: {
                    items: "=",
                    transformedValue: "=",
                    widgetsCtrl: "=",
                    edit: "=",
                    uid: "=",
                    template: "=",
                    options: "="
                }
            };

            // Combines user specified options with the template options and returns a fully configured AngularJS
            // directive definition Object.
            return angular.merge(template_options, options);
        }

        return ParlayWidgetTemplate;
    }

}());