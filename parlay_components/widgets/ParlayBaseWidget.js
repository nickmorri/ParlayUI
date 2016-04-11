function ParlayBaseWidget($mdDialog, $compile, ParlayWidgetTransformer) {
    return {
        scope: true,
        restrict: "E",
        link: function (scope, element) {

            scope.initialized = false;

            function compileWrapper() {
                var scopeRef = scope;
                var elementRef = element;

                return function (template) {
                    if (scopeRef.template != template.template) {
                        while (elementRef[0].firstChild) {
                            angular.element(elementRef[0].firstChild).scope().$destroy();
                            elementRef[0].removeChild(elementRef[0].firstChild);
                        }

                        elementRef[0].appendChild($compile(template.template)(scopeRef.$new())[0]);
                        scopeRef.template = template;
                    }
                };
            }

            scope.edit = function (initialize) {
                $mdDialog.show({
                    templateUrl: "../parlay_components/widgets/directives/parlay-base-widget-configuration-dialog.html",
                    clickOutsideToClose: false,
                    controller: "ParlayBaseWidgetConfigurationDialogController",
                    controllerAs: "dialogCtrl",
                    locals: {
                        selectedItems: !!scope.selectedItems && scope.selectedItems.length >= 0 ? scope.selectedItems : [],
                        transform: !!scope.transformer ? scope.transformer.functionString : "",
                        template: scope.template,
                        widgetCompiler: compileWrapper()
                    }
                }).then(function (result) {
                    scope.selectedItems = result.selectedItems;
                    scope.initialized = true;
                    scope.transformer = new ParlayWidgetTransformer(scope, result.transform);
                }).catch(function () {
                    if (initialize) {
                        scope.widgetsCtrl.remove(scope.$index);
                    }
                });
            };

            scope.edit(true);

        }
    };
}

function ParlayBaseWidgetConfigurationDialogController($scope, $mdDialog, ParlayWidgetsCollection, ParlayWidgetTransformer, selectedItems, transform, template, widgetCompiler) {

    $scope.selectedItems = selectedItems;
    $scope.template = template;

    $scope.transformer = new ParlayWidgetTransformer($scope, transform);

    this.cancel = function () {
        $mdDialog.cancel();
    };

    this.hide = function () {
        $mdDialog.hide({transform: $scope.transformer.functionString, selectedItems: $scope.selectedItems, template: $scope.template.template});
    };
    
    this.onTemplateSelectClose = function () {
        if (this.validTemplate()) {
            widgetCompiler($scope.template);
            
            if ($scope.template.type != "input") {
                $scope.currentTabIndex++;
            }
            
        }
    };

    this.getTemplates = function () {
        return ParlayWidgetsCollection.getAvailableWidgets();
    };

    this.validTemplate = function () {
        return !!$scope.template;
    };

    this.validSource = function () {
        return $scope.template.type == "input" || $scope.selectedItems.length > 0;
    };

    this.validTransformation = function () {
        return true;
    };

    this.validConfiguration = function () {
        return this.validTemplate() && this.validSource() && this.validTransformation();
    };

}

function ParlayBaseWidgetConfigurationSourceController($scope, ParlayData, ParlayWidgetInputManager) {

    function inputs() {
        return ParlayWidgetInputManager.getInputs();
    }

    function buttons() {
        return ParlayWidgetInputManager.getButtons();
    }

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
            return item.name.indexOf(lowercase_query) > -1 && $scope.selectedItems.indexOf(item) === -1;
        });

        var filter_inputs = inputs().filter(function (input) {
            return input.name.indexOf(lowercase_query) > -1 && $scope.selectedItems.indexOf(input) === -1;
        });

        var filtered_buttons = buttons().filter(function (button) {
            return button.name.indexOf(lowercase_query) > -1 && $scope.selectedItems.indexOf(button) === -1;
        });

        return filtered_items.concat(filter_inputs).concat(filtered_buttons);

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

angular.module("parlay.widgets.base", ["ngMaterial", "ui.ace", "parlay.widgets.collection", "parlay.widgets.inputmanager", "parlay.widget.transformer", "parlay.data"])
    .controller("ParlayBaseWidgetConfigurationDialogController", ["$scope", "$mdDialog", "ParlayWidgetsCollection", "ParlayWidgetTransformer", "selectedItems", "transform", "template", "widgetCompiler", ParlayBaseWidgetConfigurationDialogController])
    .controller("ParlayBaseWidgetConfigurationSourceController", ["$scope", "ParlayData", "ParlayWidgetInputManager", ParlayBaseWidgetConfigurationSourceController])
    .directive("parlayBaseWidget", ["$mdDialog", "$compile", "ParlayWidgetTransformer", ParlayBaseWidget]);