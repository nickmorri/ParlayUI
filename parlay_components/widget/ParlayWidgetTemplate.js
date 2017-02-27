(function () {
    "use strict";

    var module_dependencies = ["parlay.data"];

    angular
        .module("parlay.widget.template", module_dependencies)
        .factory("ParlayWidgetTemplate", ParlayWidgetTemplateFactory);

    function ParlayWidgetTemplateFactory () {

        /**
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
         * @constructor module:ParlayWidget.ParlayWidgetTemplate
         * @param {Object} options - The following attributes are specific to the ParlayWidgetTemplate:
         *
         *      [optional] A AngularJS directive link function that the user can define for custom behavior.
         *      Custom functionality that interacts with the DOM should be defined here. If integrating a separate JavaScript
         *      library, such as graphing or charting, this is where it should be hooked in.
         *
         *      customLink {Function} (scope, element) :
         *          scope {Object} - Isolated scope of the directive.
         *          element {HTMLElement} - HTML element of directive.
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
        function ParlayWidgetTemplate(options, display_name) {

            var custom_link = options.customLink;
            var customization_defaults = options.customizationDefaults;
            var custom_properties = !!options.properties ? options.properties : {};

            // We don't need the customLink attribute in the directive definition Object.
            if (!!custom_link) {
                delete options.customLink;
            }

            // We don't need the scopeDefaults attribute in the directive definition Object.
            if (!!customization_defaults) {
                delete options.customizationDefaults;
            }

            if(!!options.properties)
            {
                delete options.properties;
            }


            /**
             * If customLink available, calls the user provided link function during directive linking.
             * Notifies parent that linking is complete.
             *
             * @param scope {Object} - Isolated scope of the directive.
             * @param element {HTMLElement} - HTML element of directive.
             * @param attrs {Object} - Key/value pairs of normalized attribute names and their attribute values.
             * @param controller {Object} - The directive's required controller instance or its own controller (if any).
             * @param transcludeFn {Function} - Transclude linking function pre-bound to the correct transclusion scope.
             */
            function link (scope, element, attrs, controller, transcludeFn) {

                //if we have customizations, we should sycn them with the default
                if(!!scope.customizations && !!customization_defaults)
                {
                    //remove every key from the current scope that is NOT in the default list
                    for(var sk in scope.customizations)
                    {
                        if(!scope.customizations.hasOwnProperty(sk)) continue; //skip builtins
                        if(!(sk in customization_defaults))
                        {
                            delete scope.customizations[sk];
                        }
                    }
                    // add every default that ISNT ins the current scope to the current scope
                    for(var dk in customization_defaults)
                    {
                        if(!customization_defaults.hasOwnProperty(dk)) continue; //skip builtins
                        if(!(dk in scope.customizations))
                        {
                            scope.customizations[dk] = angular.copy(customization_defaults[dk]);
                        }
                    }
                }
                // If the user defined customizations and we don't have any we should assign them.
                else if (!scope.customizations && !!customization_defaults) {
                    scope.customizations = angular.copy(customization_defaults);
                }

                scope.properties = {};
                //inject all of the custom properties into the scope
                for(var key in custom_properties)
                {   // only keys for this object
                    if(custom_properties.hasOwnProperty(key))
                    {
                        scope.properties[key] = {value: custom_properties[key].default};
                    }
                }

                if(scope.widgetsCtrl)
                {
                    var widgetsCtrl = scope.widgetsCtrl;
                    //auto assign a name if we don't already have one
                    if(!scope.info.name) scope.info.name = widgetsCtrl.registerScope(display_name, scope);
                    else widgetsCtrl.registerScope(scope.info.name, scope);
                    //handle deregistration on destruction
                    scope.$on("$destroy", function(){
                        widgetsCtrl.deregisterScope(scope.info.name);
                    });
                }


                //function to add the watcher. This trickery is needed because we may modify the
                // name in the watcher
                function addWatcher() {
                    var unwatch =  scope.$watch('info.name', function(newVal, oldVal, scope){
                        var verified_name = scope.widgetsCtrl.renameScope(newVal, oldVal);
                        if(verified_name != newVal) //if we had to modify the name to make it unique
                        {
                            //un hook the wacher so that it won't recursively trigger
                            unwatch();
                            scope.info.name = verified_name;

                            //then re-hook it for the next change
                            addWatcher();
                        }

                    }, true);
                }

                addWatcher();

                // If the user defined a customLink we should call it.
                if (!!custom_link) {
                    custom_link(scope, element, attrs, controller, transcludeFn);
                }

                // ParlayWidgets should notify their parent, ParlayBaseWidget, when they are loaded.
                scope.$emit("parlayWidgetTemplateLoaded");
            }

            /**
             * @attribute {String} restrict - Restricts ParlayWidget constructed using ParlayWidgetTemplate to elements.
             * @attribute {Function} link - Function that is called during directive linking. Specified in the customizations
             * configuration Object.
             * @attribute {Object} scope - Define the scope bindings for the ParlayWidget.
             *
             *      The bindings specified in the scope attribute correspond to attributes that live in the scope of
             *      ParlayBaseWidget. A brief description is given here. A full explanation is available in ParlayBaseWidget
             *      documentation.
             *
             *      @attribute {Array} items - Items the user selected during widget configuration.
             *      @attribute {(Number|String|Object)} transformedValue - Result of the transform statement defined during widget configuration.
             *      @attribute {Object} widgetsCtrl - Controller of the widget workspace.
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
                    customizations: "=",
                    info:"="
                }
            };

            // Combines user specified options with the template options and returns a fully configured AngularJS
            // directive definition Object.
            return angular.merge(template_options, options);
        }

        return ParlayWidgetTemplate;
    }

}());