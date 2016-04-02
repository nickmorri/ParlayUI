function ParlayBaseWidget() {
    return {
        restrict: "E"
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
    .directive("parlayBaseWidget", [ParlayBaseWidget]);