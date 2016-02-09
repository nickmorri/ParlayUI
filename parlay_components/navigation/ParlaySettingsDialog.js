function ParlaySettingsDialogController ($mdDialog, ParlayStore, PromenadeBroker) {

    this.hide = function () {
        $mdDialog.hide();
    };

    this.saveDiscovery = function () {
        var time = new Date();
        PromenadeBroker.getLastDiscovery().download("discovery_" + time.toISOString() + ".txt");
    };

    this.loadDiscovery = function (event) {
        event.target.getElementsByTagName("input")[0].click();
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

}

angular.module("parlay.settings.dialog", ["promenade.broker", "parlay.store"])
    .controller("ParlaySettingsDialogController", ["$mdDialog", "ParlayStore", "PromenadeBroker", ParlaySettingsDialogController]);