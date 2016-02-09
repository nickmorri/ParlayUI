function ParlaySettingsDialogController ($scope, $mdDialog, ParlaySettings, PromenadeBroker) {

    this.hide = function () {
        $mdDialog.hide();
    };

    this.requestDiscovery = function () {
        PromenadeBroker.requestDiscovery(true);
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

    var discovery_settings = ParlaySettings.getDiscoverySettings();

    $scope.auto_discovery = discovery_settings && discovery_settings.auto_discovery ? true : false;

    $scope.$watch("auto_discovery", function (newValue) {
        $scope.auto_discovery_message = newValue ? "enabled" : "disabled";
        ParlaySettings.setDiscoverySettings({auto_discovery: newValue});
    });

}

angular.module("parlay.settings.dialog", ["parlay.settings", "promenade.broker"])
    .controller("ParlaySettingsDialogController", ["$scope", "$mdDialog", "ParlaySettings", "PromenadeBroker", ParlaySettingsDialogController]);