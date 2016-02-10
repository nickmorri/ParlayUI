function ParlaySettingsFactory (ParlayStore) {

    var store = ParlayStore("settings");
    store.moveItemToSession("autosave");

    function ParlaySettings () {
        if (!store.hasSessionItem("discovery_settings")) {
            this.setDiscoverySettings({auto_discovery: true});
        }
        if (!store.hasSessionItem("log_settings")) {
            this.setLogSettings({max_size: 10000});
        }
    }

    ParlaySettings.prototype.getDiscoverySettings = function () {
        return store.getSessionItem("discovery_settings");
    };

    ParlaySettings.prototype.setDiscoverySettings = function (settings) {
        store.setSessionItem("discovery_settings", settings);
        store.moveItemToLocal("autosave");
    };

    ParlaySettings.prototype.getLogSettings = function () {
        return store.getSessionItem("log_settings");
    };

    ParlaySettings.prototype.setLogSettings = function (settings) {
        store.setSessionItem("log_settings", settings);
        store.moveItemToLocal("autosave");
    };

    return new ParlaySettings();
}

angular.module("parlay.settings", ["parlay.store"])
    .factory("ParlaySettings", ["ParlayStore", ParlaySettingsFactory]);