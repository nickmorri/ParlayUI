function ParlayBaseWidgetConfigurationDialogController($scope, $mdDialog, ParlayWidgetTransformer, ParlayWidgetEventHandler, selectedEvent, transformer, handler, template, widgetCompiler) {

    $scope.configuration = {
        selectedItems: !!transformer && transformer.items.length > 0 ? transformer.items : [],
        selectedEvent: selectedEvent,
        template: template,
        transformer: transformer,
        handler: handler
    };

    this.cancel = function () {
        $mdDialog.cancel();
    };

    this.hide = function () {
        $mdDialog.hide($scope.configuration);
    };

    this.validTemplate = function () {
        return !!$scope.configuration.template;
    };

    this.validSource = function () {
        return $scope.configuration.template.type == "input" || $scope.configuration.selectedItems.length > 0;
    };

    this.validTransformation = function () {
        return true;
    };

    this.validConfiguration = function () {
        return this.validTemplate() && this.validSource() && this.validTransformation();
    };

    $scope.$watch("configuration.template", function () {
        if (this.validTemplate()) {

            widgetCompiler($scope.configuration.template);

            if ($scope.configuration.template.type == "input") {
                $scope.configuration.selectedItems = [];
            }
            else if ($scope.configuration.template.type == "display") {
                $scope.configuration.selectedEvents = [];
            }

        }
    }.bind(this));

}

function ParlayBaseWidgetConfigurationTemplateController($scope, ParlayWidgetsCollection) {

    this.getTemplates = function () {
        return ParlayWidgetsCollection.getAvailableWidgets();
    };

}

function ParlayBaseWidgetConfigurationEventController($scope, ParlayWidgetInputManager) {

    this.getEvents = function () {
        var element = ParlayWidgetInputManager.getElements().find(function (element) {
            return element.name.indexOf($scope.configuration.template.name) > -1;
        });

        return !!element ? element.events : [];
    };

    this.querySearch = function (query) {
        var lowercase_query = query.toLowerCase();

        var events = this.getEvents();

        return Object.keys(events).filter(function (key) {
            return key.indexOf(lowercase_query) > -1 && $scope.configuration.selectedEvents.indexOf(events[key]) === -1;
        }).map(function (key) {
            return events[key];
        });
    };

}

function ParlayBaseWidgetConfigurationHandlerController($scope, ParlayWidgetEventHandler) {

    $scope.$watch("configuration.selectedEvent", function (newValue, oldValue) {

        if (!!oldValue && oldValue.length > 0 && !!newValue) {
            oldValue.clearAllListeners();
        }
        if (!!newValue) {
            $scope.configuration.handler = new ParlayWidgetEventHandler(newValue);
        }

    });

}

function ParlayBaseWidgetConfigurationSourceController($scope, ParlayData, ParlayWidgetInputManager) {

    function items() {
        var iterator = ParlayData.values();
        var values = [];
        for (var current = iterator.next(); !current.done; current = iterator.next()) {
            values.push(current.value);
        }
        return values;
    }

    this.querySearch = function (query) {

        var lowercase_query = query.toLowerCase();

        var filtered_items = items().filter(function (item) {
            return item.name.indexOf(lowercase_query) > -1 && $scope.configuration.selectedItems.indexOf(item) === -1;
        });

        var filtered_elements = ParlayWidgetInputManager.getElements().filter(function (element) {
            return element.name.indexOf(lowercase_query) > -1 && $scope.configuration.selectedItems.indexOf(element) === -1;
        });

        return filtered_items.concat(filtered_elements);

    };

    this.change = function (item) {
        if (!!item && item.type == "datastream") {
            item.listen(false);
        }
        else if (!!item && item.type == "property") {
            item.get();
        }
    };

}

function ParlayBaseWidgetConfigurationTransformController($scope, ParlayWidgetTransformer) {

    function buildTemplate(items, actuals, parameters, body) {
        "use strict";

        function buildActuals(items) {

            var item_actuals = !!items && items.length > 0 ? items.map(function (current) {
                return current.name + "_value";
            }) : [];

            return "(" + item_actuals.join(", ") + ")";
        }

        function buildParameters(items) {
            var parameters = [];

            for (var i = 0; i < (!!items ? items.length : 0); i++) {
                parameters.push("var" + i);
            }

            return "(" + parameters.join(", ") + ")";
        }

        parameters = !!parameters ? parameters : buildParameters(items);
        body = !!body ? body : "{ return undefined; }";
        actuals = !!actuals ? actuals : buildActuals(items);

        return "(function " + parameters + body + actuals + ")";
    }

    // Establish a watcher that will manage onChange handlers for the selected values.
    $scope.$watchCollection("configuration.selectedItems", function (newValue, oldValue) {
        "use strict";

        if (newValue.some(function (item) { return oldValue.indexOf(item) === -1; })) {

            if (!!$scope.configuration.transformer) {
                $scope.configuration.transformer.cleanHandlers();
            }

            $scope.configuration.transformer = new ParlayWidgetTransformer(buildTemplate(newValue), newValue);
        }
        
    });

    this.onEditorLoad = function (editor) {
        editor.$blockScrolling = Infinity;
        ace.require("ace/ext/language_tools");
        editor.setOptions({enableBasicAutocompletion: true, enableLiveAutocompletion: true});
    };

}

angular.module("parlay.widgets.base.configuration", ["ui.ace", "parlay.widgets.collection", "parlay.widgets.inputmanager", "parlay.widget.transformer", "parlay.widgets.eventhandler", "parlay.data"])
    .controller("ParlayBaseWidgetConfigurationDialogController", ["$scope", "$mdDialog", "ParlayWidgetTransformer", "ParlayWidgetEventHandler", "selectedEvent", "transformer", "handler", "template", "widgetCompiler", ParlayBaseWidgetConfigurationDialogController])
    .controller("ParlayBaseWidgetConfigurationTemplateController", ["$scope", "ParlayWidgetsCollection", ParlayBaseWidgetConfigurationTemplateController])
    .controller("ParlayBaseWidgetConfigurationEventController", ["$scope", "ParlayWidgetInputManager", ParlayBaseWidgetConfigurationEventController])
    .controller("ParlayBaseWidgetConfigurationHandlerController", ["$scope", "ParlayWidgetEventHandler", ParlayBaseWidgetConfigurationHandlerController])
    .controller("ParlayBaseWidgetConfigurationSourceController", ["$scope", "ParlayData", "ParlayWidgetInputManager", ParlayBaseWidgetConfigurationSourceController])
    .controller("ParlayBaseWidgetConfigurationTransformController", ["$scope", "ParlayWidgetTransformer", ParlayBaseWidgetConfigurationTransformController]);