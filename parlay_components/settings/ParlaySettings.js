function ParlaySettingsFactory (ParlayStore) {

    var store = ParlayStore("settings");

    function ParlaySettings () {
        if (!store.has("discovery_settings")) {
            this.setDiscoverySettings({auto_discovery: true});
        }
        if (!store.has("log_settings")) {
            this.setLogSettings({max_size: 10000});
        }
        if (!store.has("graph_settings")) {
            this.setGraphSettings({label_size: 12});
        }
    }

    ParlaySettings.prototype.getDiscoverySettings = function () {
        return store.get("discovery_settings");
    };

    ParlaySettings.prototype.setDiscoverySettings = function (settings) {
        store.set("discovery_settings", settings);
    };

    ParlaySettings.prototype.getLogSettings = function () {
        return store.get("log_settings");
    };

    ParlaySettings.prototype.setLogSettings = function (settings) {
        store.set("log_settings", settings);
    };

    ParlaySettings.prototype.getGraphSettings = function () {
        return store.get("graph_settings");
    };

    ParlaySettings.prototype.setGraphSettings = function (settings) {
        store.set("graph_settings", settings);
    };

    return new ParlaySettings();
}

angular.module("parlay.settings", ["parlay.store"])
    .factory("ParlaySettings", ["ParlayStore", ParlaySettingsFactory]);