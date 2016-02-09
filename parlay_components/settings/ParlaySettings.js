function ParlaySettingsFactory (ParlayStore) {

    var store = ParlayStore("settings");
    store.moveItemToSession("autosave");

    function ParlaySettings () {
        if (!store.hasSessionItem("discovery_settings")) {
            this.setDiscoverySettings({auto_discovery: true});
        }
    }

    ParlaySettings.prototype.getDiscoverySettings = function () {
        return store.getSessionItem("discovery_settings");
    };

    ParlaySettings.prototype.setDiscoverySettings = function (settings) {
        store.setSessionItem("discovery_settings", settings);
        store.moveItemToLocal("autosave");
    };

    return new ParlaySettings();
}

angular.module("parlay.settings", ["parlay.store"])
    .factory("ParlaySettings", ["ParlayStore", ParlaySettingsFactory]);