(function () {
    "use strict";
    
    var module_dependencies = ["parlay.settings", "parlay.utility", "promenade.broker"];

    angular
        .module("parlay.settings.dialog", module_dependencies)
        .controller("ParlaySettingsDialogController", ParlaySettingsDialogController);

    /* istanbul ignore next */
    ParlaySettingsDialogController.$inject = ["$scope", "$timeout", "$mdDialog", "ParlaySettings", "PromenadeBroker", "ParlayObject"];
    /**
     * @constructor module:ParlaySettings.ParlaySettingsDialogController
     * @param {Object} $scope - AngularJS [$scope]{@link https://docs.angularjs.org/guide/scope} Object.
     * @param {Object} $mdDialog - Angular Material [$mdDialog]{@link https://material.angularjs.org/latest/api/service/$mdDialog} service.
     * @param {Object} ParlaySettings - [ParlaySettings]{@link module:ParlaySettings.ParlaySettings} service.
     * @param {Object} PromenadeBroker - [PromenadeBroker]{@link module:PromenadeBroker.PromenadeBroker} service.
     */
    function ParlaySettingsDialogController ($scope, $timeout, $mdDialog, ParlaySettings, PromenadeBroker, ParlayObject) {

        var ctrl = this;

        // Attach methods to controller.
        ctrl.saveDiscovery = saveDiscovery;
        ctrl.loadDiscovery = loadDiscovery;
        ctrl.fileChanged = fileChanged;
        ctrl.requestNotificationPermission = requestNotificationPermission;
        ctrl.supportsNotifications = supportsNotifications;

        // Attach $mdDialog.hide to controller to allow user to dismiss dialog.
        ctrl.hide = $mdDialog.hide;
        ctrl.restoreDefault = restoreDefault;

        var log_settings, graph_settings, broker_settings;
        loadStaticSettingValues();

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

        function loadStaticSettingValues () {
            log_settings = ParlaySettings.get("log");
            graph_settings = ParlaySettings.get("graph");
            broker_settings = ParlaySettings.get("broker");

            $scope.auto_discovery = broker_settings && broker_settings.auto_discovery;
            $scope.max_log_size = log_settings && parseInt(log_settings.max_size);
            $scope.label_size = graph_settings && parseInt(graph_settings.label_size);
            $scope.show_prompt = broker_settings && broker_settings.show_prompt;
        }

        function restoreDefault (setting) {
            ParlaySettings.restoreDefault(setting);
            loadStaticSettingValues();
        }

        /**
         * Download the last discovery information as a text file.
         * @member module:ParlaySettings.ParlaySettingsDialogController#saveDiscovery
         * @public
         */
        function saveDiscovery () {



            var last_discovery = new ParlayObject(PromenadeBroker.getLastDiscovery());
            last_discovery.download("discovery_" + (new Date()).toISOString() + ".txt");
        }

        /**
         * Initiate click event to trigger file input to open.
         * @member module:ParlaySettings.ParlaySettingsDialogController#loadDiscovery
         * @public
         */
        function loadDiscovery (event) {
            $timeout(function() {
                event.target.parentElement.getElementsByTagName("input")[0].click();
            });
        }

        /**
         * Handler for file input change event. Provides the
         * [PromenadeBroker]{@link module:PromenadeBroker.PromenadeBroker} with the discovery information from the text file.
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
         * Requests the end-user's browser for permission to display [HTML5 Notifications]{@link https://developer.mozilla.org/en-US/docs/Web/API/notification}.
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
         * True if the end-user's browser supports [HTML5 Notifications]{@link https://developer.mozilla.org/en-US/docs/Web/API/notification}.
         * @member module:ParlaySettings.ParlaySettingsDialogController#supportsNotifications
         * @public
         */
        function supportsNotifications () {
            return "Notification" in window;
        }

    }

}());