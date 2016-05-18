(function () {
    "use strict";

    var module_dependencies = ["ui.ace", "parlay.widget.collection", "parlay.widget.inputmanager", "parlay.widget.transformer", "parlay.widget.eventhandler", "parlay.data"];

    angular
        .module("parlay.widget.base.configuration", module_dependencies)
        .controller("ParlayWidgetBaseConfigurationDialogController", ParlayWidgetBaseConfigurationDialogController)
        .controller("ParlayWidgetBaseConfigurationTemplateController", ParlayWidgetBaseConfigurationTemplateController)
        .controller("ParlayWidgetBaseConfigurationEventController", ParlayWidgetBaseConfigurationEventController)
        .controller("ParlayWidgetBaseConfigurationHandlerController", ParlayWidgetBaseConfigurationHandlerController)
        .controller("ParlayWidgetBaseConfigurationSourceController", ParlayWidgetBaseConfigurationSourceController)
        .controller("ParlayWidgetBaseConfigurationTransformController", ParlayWidgetBaseConfigurationTransformController)
        .controller("ParlayWidgetBaseConfigurationCustomizationController", ParlayWidgetBaseConfigurationTransformController)
        .directive("parlayWidgetBaseConfigurationTemplate", ParlayWidgetBaseConfigurationTemplateDirective)
        .directive("parlayWidgetBaseConfigurationEvent", ParlayWidgetBaseConfigurationEventDirective)
        .directive("parlayWidgetBaseConfigurationHandler", ParlayWidgetBaseConfigurationHandlerDirective)
        .directive("parlayWidgetBaseConfigurationTransform", ParlayWidgetBaseConfigurationTransformDirective)
        .directive("parlayWidgetBaseConfigurationSource", ParlayWidgetBaseConfigurationSourceDirective)
        .directive("parlayWidgetBaseConfigurationCustomization", ParlayWidgetBaseConfigurationCustomizationDirective)
        .directive("compile", compile);

    // Used to compile tab bodies.
    compile.$inject = ["$compile"];
    function compile ($compile) {
        return function (scope, element, attributes) {
            scope.$watch(function (scope) {
                return scope.$eval(attributes.compile);
            }, function (value) {
                element.html(value);
                $compile(element.contents())(scope);
            });
        };
    }

    ParlayWidgetBaseConfigurationDialogController.$inject = ["$scope", "$mdDialog", "configuration", "widgetCompiler"];
    function ParlayWidgetBaseConfigurationDialogController ($scope, $mdDialog, configuration, widgetCompiler) {

        var ctrl = this;

        $scope.configuration = configuration;

        ctrl.cancel = cancel;
        ctrl.hide = hide;
        
        function cancel () {
            $mdDialog.cancel();
        }

        function hide () {
            $mdDialog.hide();
        }

        $scope.$watch("configuration.template", function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                widgetCompiler($scope.configuration.template);
            }
        });

    }

    ParlayWidgetBaseConfigurationTemplateController.$inject = ["ParlayWidgetCollection"];
    function ParlayWidgetBaseConfigurationTemplateController (ParlayWidgetCollection) {

        var ctrl = this;
        
        ctrl.getTemplates = getTemplates;

        function getTemplates () {
            return ParlayWidgetCollection.getAvailableWidgets();
        }

    }

    ParlayWidgetBaseConfigurationEventController.$inject = ["$scope", "ParlayWidgetInputManager", "ParlayWidgetEventHandler"];
    function ParlayWidgetBaseConfigurationEventController ($scope, ParlayWidgetInputManager) {

        var ctrl = this;

        ctrl.queryEvents = queryEvents;
        ctrl.addHandler = addHandler;
        ctrl.removeHandler = removeHandler;

        function addHandler (event) {
            ParlayWidgetInputManager.registerHandler(event);
        }

        function removeHandler (event) {
            ParlayWidgetInputManager.deregisterHandler(event);
        }

        function queryEvents (query) {
            var lowercase_query = angular.lowercase(query);

            return ParlayWidgetInputManager.getEvents().filter(function (event) {
                var lowercase = angular.lowercase(event.event + event.element.element_name + event.element.widget_name);
                return (lowercase).includes(lowercase_query) &&
                    $scope.configuration.selectedEvents.indexOf(event) === -1;
            });
        }

        $scope.$watch("configuration.template.type", function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                if (newValue == "input") {
                    $scope.configuration.selectedEvents = [];
                    $scope.currentTabIndex = 1;
                }
                else if (!!$scope.configuration.selectedEvents) {
                    $scope.configuration.selectedEvents.forEach(function (event) {
                        event.handler.detach();
                    });
                    $scope.configuration.selectedEvents = [];
                }
            }
        });

        $scope.$watch("configuration.template.name", function (newValue, oldValue) {
            if (!!oldValue && !angular.equals(newValue, oldValue)) {
                $scope.configuration.selectedEvents.forEach(function (event) {
                    event.handler.detach();
                });
                $scope.configuration.selectedEvents = [];
            }
        });

    }

    ParlayWidgetBaseConfigurationHandlerController.$inject = ["ParlayData"];
    function ParlayWidgetBaseConfigurationHandlerController (ParlayData) {

        var ctrl = this;

        ctrl.onEditorLoad = onEditorLoad;

        var static_completer_entries = [
            {
                caption: "ParlaySocket.sendMessage",
                value: "ParlaySocket.sendMessage({}, {})"
            },
            {
                caption: "log",
                value: 'log("hello world")',
                meta: "console.log"
            },
            {
                caption: "alert",
                value: 'alert("hello world")',
                meta: "window.alert"
            },
            {
                caption: "event",
                value: "event",
                meta: "JavaScript event"
            }
        ];

        function items() {
            var iterator = ParlayData.values();
            var values = [];
            for (var current = iterator.next(); !current.done; current = iterator.next()) {
                values.push(current.value);
            }
            return values;
        }

        function generateCompleter(initial_entries) {
            return {
                getCompletions: function (editor, session, pos, prefix, callback) {
                    callback(null, items().reduce(function (accumulator, item) {

                        var methods = Object.getOwnPropertyNames(item).filter(function (prop) {
                            return typeof item[prop] == 'function' && item[prop].name != "bound ";
                        }).map(function (prop) {
                            return item[prop];
                        });

                        var entries = methods.map(function (method) {
                            return {
                                caption: item.name + "." + method.name + "()",
                                value: item.name + "." + method.name + "()",
                                meta: "Parlay{" + item.type + "} method"
                            };
                        });

                        entries.push({
                            caption: item.name + ".value",
                            value: item.name + ".value",
                            meta: "Parlay{" + item.type + "} value"
                        });

                        return accumulator.concat(entries);
                    }, initial_entries));
                }
            };
        }

        function onEditorLoad (editor) {
            editor.$blockScrolling = Infinity;
            ace.require("ace/ext/language_tools");
            editor.setOptions({enableBasicAutocompletion: true, enableLiveAutocompletion: true});
            editor.completers = [generateCompleter(static_completer_entries)];
        }

    }

    ParlayWidgetBaseConfigurationSourceController.$inject = ["$scope", "ParlayData", "ParlayWidgetInputManager", "ParlayWidgetTransformer"];
    function ParlayWidgetBaseConfigurationSourceController ($scope, ParlayData, ParlayWidgetInputManager, ParlayWidgetTransformer) {

        var ctrl = this;

        ctrl.querySearch = querySearch;
        ctrl.onAdd = onAdd;
        ctrl.onRemove = onRemove;

        function items() {
            var iterator = ParlayData.values();
            var values = [];
            for (var current = iterator.next(); !current.done; current = iterator.next()) {
                values.push(current.value);
            }
            return values;
        }

        function querySearch (query) {
            var lowercase_query = query.toLowerCase();

            var filtered_items = items().filter(function (item) {
                return item.name.indexOf(lowercase_query) > -1 && $scope.configuration.selectedItems.indexOf(item) === -1;
            });

            var filtered_elements = ParlayWidgetInputManager.getElements().filter(function (element) {
                return element.element_name.indexOf(lowercase_query) > -1 && $scope.configuration.selectedItems.indexOf(element) === -1;
            });

            return filtered_items.concat(filtered_elements);
        }

        function onAdd ($chip) {
            $scope.configuration.transformer.addItem($chip);
        }

        function onRemove ($chip) {
            $scope.configuration.transformer.removeItem($chip);
        }

        $scope.$watch("configuration.template.type", function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                if (newValue == "display") {
                    $scope.configuration.selectedItems = [];
                    $scope.configuration.transformer = new ParlayWidgetTransformer();
                    $scope.currentTabIndex = 2;
                }
                else if (!!$scope.configuration.transformer) {
                    $scope.configuration.transformer.cleanHandlers();
                    $scope.configuration.selectedItems = [];
                }
            }
        });

    }

    ParlayWidgetBaseConfigurationTransformController.$inject = ["$scope"];
    function ParlayWidgetBaseConfigurationTransformController ($scope) {

        var ctrl = this;

        ctrl.onEditorLoad = onEditorLoad;

        var static_completer_entries = [];

        function generateCompleter(initial_entries) {
            return {
                getCompletions: function (editor, session, pos, prefix, callback) {
                    callback(null, $scope.configuration.selectedItems.reduce(function (accumulator, item) {
                        return accumulator.concat([{
                            caption: item.name + ".value",
                            value: item.name + ".value",
                            meta: "Parlay{" + item.type + "} value"
                        }]);
                    }, initial_entries));
                }
            };
        }

        function onEditorLoad (editor) {
            editor.$blockScrolling = Infinity;
            ace.require("ace/ext/language_tools");
            editor.setOptions({enableBasicAutocompletion: true, enableLiveAutocompletion: true});
            editor.completers = [generateCompleter(static_completer_entries)];
        }

    }

    ParlayWidgetBaseConfigurationCustomizationController.$inject = ["$scope"];
    function ParlayWidgetBaseConfigurationCustomizationController ($scope) {

    }

    function ParlayWidgetBaseConfigurationTemplateDirective () {
        return {
            templateUrl: "../parlay_components/widget/directives/parlay-widget-base-configuration-template.html",
            controller: "ParlayWidgetBaseConfigurationTemplateController",
            controllerAs: "templateCtrl"
        };
    }

    function ParlayWidgetBaseConfigurationEventDirective () {
        return {
            templateUrl: "../parlay_components/widget/directives/parlay-widget-base-configuration-event.html",
            controller: "ParlayWidgetBaseConfigurationEventController",
            controllerAs: "eventCtrl"
        };
    }

    function ParlayWidgetBaseConfigurationHandlerDirective () {
        return {
            templateUrl: "../parlay_components/widget/directives/parlay-widget-base-configuration-handler.html",
            controller: "ParlayWidgetBaseConfigurationHandlerController",
            controllerAs: "handlerCtrl"
        };
    }

    function ParlayWidgetBaseConfigurationTransformDirective () {
        return {
            templateUrl: "../parlay_components/widget/directives/parlay-widget-base-configuration-transform.html",
            controller: "ParlayWidgetBaseConfigurationTransformController",
            controllerAs: "transformCtrl"
        };
    }

    function ParlayWidgetBaseConfigurationSourceDirective () {
        return {
            templateUrl: "../parlay_components/widget/directives/parlay-widget-base-configuration-source.html",
            controller: "ParlayWidgetBaseConfigurationSourceController",
            controllerAs: "sourceCtrl"
        };
    }

    function ParlayWidgetBaseConfigurationCustomizationDirective () {
        return {
            scope: {
                options: "="
            },
            templateUrl: "../parlay_components/widget/directives/parlay-widget-base-configuration-customization.html",
            controller: "ParlayWidgetBaseConfigurationCustomizationController",
            controllerAs: "customizationCtrl"
        };
    }

}());