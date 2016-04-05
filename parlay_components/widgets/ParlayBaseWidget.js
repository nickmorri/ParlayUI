function ParlayBaseWidget($mdDialog) {
    return {
        scope: true,
        restrict: "E",
        link: function (scope, element, attributes) {

            function showDialog(configuration) {
                $mdDialog.show({
                    templateUrl: "../parlay_components/widgets/directives/parlay-base-widget-configuration-dialog.html",
                    clickOutsideToClose: true,
                    controller: "ParlayBaseWidgetConfigurationDialogController",
                    controllerAs: "dialogCtrl",
                    locals: { configuration: configuration },
                    bindToController: true
                }).then(function (result) {
                    scope.info = result.selectedItem;
                    scope.transform = eval("(" + result.transform + ")");
                });
            }

            showDialog({
                selectedItem: undefined,
                transform: function (input) { return input; }.toString()
            });

            scope.edit = function () {
                showDialog({
                    selectedItem: scope.info,
                    transform: scope.transform.toString()
                });
            };

        }
    };
}

function ParlayDemoWidget() {
    return {
        scope: {
            info: "=",
            transform: "&",
            edit: "&"
        },
        templateUrl: "../parlay_components/widgets/directives/parlay-demo-widget.html",
        link: function (scope, element, attributes) {

            function watcher() {
                scope.$digest();
            }

            var reg;

            scope.$watch("info", function (newValue, oldValue) {
                if (!!newValue) {

                    if (!!reg && newValue != oldValue) {
                        reg();
                    }

                    reg = newValue.onChange(watcher);
                }
            });
        }
    };
}

function ParlayBaseWidgetConfigurationDialogController($mdDialog) {

    this.markStage = function (stage, state) {
        this.stageComplete[stage] = state;
    }.bind(this);
    
    this.stageAccessible = function (stage) {
        return stage == "source" || this.stageComplete.source;
    };

    this.previous = function () {
        if (this.currentStage == "transform") {
            this.currentStage = "source";
            this.currentTab = 0;
        }
    };

    this.next = function () {
        if (this.currentStage == "source") {
            this.currentStage = "transform";
            this.currentTab = 1;
        }
    };
    
    this.isConfigurationComplete = function () {
        return Object.keys(this.stageComplete).every(function (key) {
            return this.stageComplete[key];
        }, this);
    };

    this.cancel = function () {
        $mdDialog.cancel();
    };

    this.hide = function () {
        $mdDialog.hide(this.configuration);
    };

    this.currentStage = "source";

    this.stageComplete= {
        source: false,
        transform: false
    };

    if (this.configuration.selectedItem !== undefined) {
        this.markStage("source", true);
    }

}

function ParlayBaseWidgetConfigurationSourceController(ParlayData) {

    this.items = function () {

        var iterator = ParlayData.values();

        var values = [];

        for (var current = iterator.next(); !current.done; current = iterator.next()) {
            values.push(current.value);
        }

        return values;
    };
    
    this.querySearch = function (query) {
        return this.items().filter(function (item) {
            return item.name.indexOf(query) > -1;
        });
    };
    
    this.selectedItemChange = function (item, func) {
        func('source', item !== null);
    };
    
}

function ParlayBaseWidgetConfigurationTransformController() {
    
}

angular.module("parlay.widgets.base", ["parlay.data", "ngMaterial", "ui.ace"])
    .controller("ParlayBaseWidgetConfigurationSourceController", ["ParlayData", ParlayBaseWidgetConfigurationSourceController])
    .controller("ParlayBaseWidgetConfigurationTransformController", [ParlayBaseWidgetConfigurationTransformController])
    .controller("ParlayBaseWidgetConfigurationDialogController", ["$mdDialog", ParlayBaseWidgetConfigurationDialogController])
    .directive("parlayDemoWidget", [ParlayDemoWidget])
    .directive("parlayBaseWidget", ["$mdDialog", ParlayBaseWidget]);