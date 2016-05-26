(function () {
    "use strict";
    
    var module_dependencies = ["parlay.settings", "promenade.broker"];

    angular
        .module("parlay.settings.dialog", module_dependencies)
        .controller("ParlaySettingsDialogController", ParlaySettingsDialogController);

    /* istanbul ignore next */
    ParlaySettingsDialogController.$inject = ["$scope", "$mdDialog", "$mdMedia", "ParlaySettings", "PromenadeBroker"];
    /**
     * @constructor module:ParlaySettings.ParlaySettingsDialogController
     * @param {Object} $scope - AngularJS $scope Object.
     * @param {Object} $mdDialog - Material Angular dialog service.
     * @param {Object} $mdMedia - Material Angular media query service.
     * @param {Object} ParlaySettings - ParlaySettings service.
     * @param {Object} PromenadeBroker - PromenadeBroker service.
     */
    function ParlaySettingsDialogController ($scope, $mdDialog, $mdMedia, ParlaySettings, PromenadeBroker) {

        var ctrl = this;

        // Attach methods to controller.
        ctrl.saveDiscovery = saveDiscovery;
        ctrl.loadDiscovery = loadDiscovery;
        ctrl.fileChanged = fileChanged;
        ctrl.requestNotificationPermission = requestNotificationPermission;
        ctrl.supportsNotifications = supportsNotifications;

        // Attach $mdDialog.hide to controller to allow user to dismiss dialog.
        ctrl.hide = $mdDialog.hide;

        var log_settings = ParlaySettings.get("log");
        var graph_settings = ParlaySettings.get("graph");
        var broker_settings = ParlaySettings.get("broker");

        $scope.auto_discovery = broker_settings && broker_settings.auto_discovery;
        $scope.max_log_size = log_settings && parseInt(log_settings.max_size);
        $scope.label_size = graph_settings && parseInt(graph_settings.label_size);
        $scope.show_prompt = broker_settings && broker_settings.show_prompt;

        $scope.notification_permission = !navigator.userAgent.includes("Edge") && Notification.permission === "granted";

        // Attach reference to $mdMedia to scope so that media queries can be done.
        $scope.$mdMedia = $mdMedia;

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

        /**
         * Download the last discovery information as a text file.
         * @member module:ParlaySettings.ParlaySettingsDialogController#saveDiscovery
         * @public
         */
        function saveDiscovery () {
            PromenadeBroker.getLastDiscovery().download("discovery_" + (new Date()).toISOString() + ".txt");
        }

        /**
         * Initiate click event to trigger file input to open.
         * @member module:ParlaySettings.ParlaySettingsDialogController#loadDiscovery
         * @public
         */
        function loadDiscovery (event) {
            event.target.parentElement.getElementsByTagName("input")[0].click();
        }

        /**
         * Handler for file input change event. Provides the Broker with the discovery information from the text file.
         * @member module:ParlaySettings.ParlaySettingsDialogController#fileChanged
         * @public
         */
        function fileChanged (event) {

            // Instantiate FileReader object
            var fileReader = new FileReader();

            $scope.$apply(function () {
                // After file load pass saved discovery data to the PromenadeBroker
                fileReader.onload = function (event) {
                    PromenadeBroker.applySavedDiscovery(JSON.parse(event.target.result));
                };
            });

            // Read file as text
            fileReader.readAsText(event.target.files[0]);
        }

        /**
         * Requests the end-user's browser for permission to display desktop notifications.
         * @member module:ParlaySettings.ParlaySettingsDialogController#requestNotificationPermission
         * @public
         */
        function requestNotificationPermission () {
            // Ensure browser has HTML 5 Notification support.
            if (!ctrl.supportsNotifications()) {
                Notification.requestPermission();
            }
            $scope.notification_permission = ctrl.supportsNotifications() && Notification.permission === "granted";
        }

        /**
         * True if the end-user's browser supports the HTML Notification API.
         * @member module:ParlaySettings.ParlaySettingsDialogController#supportsNotifications
         * @public
         */
        function supportsNotifications () {
            return "Notification" in window;
        }

    }

}());