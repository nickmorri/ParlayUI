function ParlaySettingsDialogController ($scope, $mdDialog, ParlaySettings, PromenadeBroker) {

    this.hide = function () {
        $mdDialog.hide();
    };

    this.saveDiscovery = function () {
        var time = new Date();
        PromenadeBroker.getLastDiscovery().download("discovery_" + time.toISOString() + ".txt");
    };

    this.loadDiscovery = function (event) {
        event.target.parentElement.getElementsByTagName("input")[0].click();
    };

    this.fileChanged = function (event) {

        // Instantiate FileReader object
        var fileReader = new FileReader();

        // After file load pass saved discovery data to the PromenadeBroker
        fileReader.onload = function (event) {
            PromenadeBroker.setSavedDiscovery(JSON.parse(event.target.result));
        };

        // Read file as text
        fileReader.readAsText(event.target.files[0]);
    };

    this.requestNotificationPermission = function () {
        // Ensure browser has HTML 5 Notification support.
        if (this.isMSEdge()) {
            Notification.requestPermission();
        }
        $scope.notification_permission = this.isMSEdge() && Notification.permission === "granted";
    };

    this.isMSEdge = function () {
        return navigator.userAgent.includes("Edge");
    };

    var log_settings = ParlaySettings.get("log");
    var graph_settings = ParlaySettings.get("graph");
    var broker_settings = ParlaySettings.get("broker");

    $scope.auto_discovery = broker_settings && broker_settings.auto_discovery;
    $scope.max_log_size = log_settings && parseInt(log_settings.max_size);
    $scope.label_size = graph_settings && parseInt(graph_settings.label_size);
    $scope.show_prompt = broker_settings && broker_settings.show_prompt;

    $scope.notification_permission = !navigator.userAgent.includes("Edge") && Notification.permission === "granted";

    $scope.$watch("auto_discovery", function (newValue) {
        ParlaySettings.set("broker", {auto_discovery: newValue});
    });

    $scope.$watch("max_log_size", function (newValue) {
        ParlaySettings.set("log", {max_size: newValue});
    });

    $scope.$watch("label_size", function (newValue) {
        ParlaySettings.set("graph", {label_size: newValue});
    });

    $scope.$watch("show_prompt", function (newValue) {
        ParlaySettings.set("broker", {show_prompt: newValue});
    });

}

angular.module("parlay.settings.dialog", ["parlay.settings", "promenade.broker"])
    .controller("ParlaySettingsDialogController", ["$scope", "$mdDialog", "ParlaySettings", "PromenadeBroker", ParlaySettingsDialogController]);