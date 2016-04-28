(function () {
    "use strict";

    var module_dependencies = ["parlay.settings", "parlay.store"];

    angular
        .module("parlay.widget.canvascontroller", module_dependencies)
        .controller("ParlayWidgetCanvasController", ParlayWidgetCanvasController);

    ParlayWidgetCanvasController.$inject = ["$scope", "ParlaySettings", "ParlayStore"];
    function ParlayWidgetCanvasController ($scope, ParlaySettings, ParlayStore) {

        var settings = ParlaySettings.get("widgets");
        var store = ParlayStore("widgets");

        $scope.editing = settings.editing;

        this.items = [];

        this.save = function () {
            store.set("default", JSON.stringify(angular.copy(this.items), function (key, value) {
                return value.constructor.name == "ParlayProtocol" ? value.protocol_name : value;
            }));
        };

        this.load = function () {
            this.items = JSON.parse(store.get("default"));
        };

        $scope.$watch("editing", function (newValue) {
            ParlaySettings.set("widgets", {editing: newValue});
        });
    }

    ParlayWidgetCanvasController.prototype.add = function () {
        this.items.push({});
    };

    ParlayWidgetCanvasController.prototype.remove = function (index) {
        this.items.splice(index, 1);
    };
    
}());