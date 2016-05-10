(function () {
    "use strict";

    var modules_dependencies = ["parlay.protocols.configuration_controller", "parlay.protocols.manager", "promenade.broker", "parlay.notification", "ngMaterial", "ngMessages", "ngMdIcons", "templates-main"];

    angular
        .module("parlay.protocols.list_controller", modules_dependencies)
        .controller("ParlayProtocolListController", ParlayProtocolListController);

    ParlayProtocolListController.$inject = ["$scope", "$mdDialog", "$mdMedia", "ParlayProtocolManager", "PromenadeBroker"];
    function ParlayProtocolListController($scope, $mdDialog, $mdMedia, ParlayProtocolManager, PromenadeBroker) {
        
        var ctrl = this;

        ctrl.hide = $mdDialog.hide;
        ctrl.connecting = false;

        ctrl.getBrokerAddress = PromenadeBroker.getBrokerAddress;
        ctrl.broker_version = PromenadeBroker.version;
        ctrl.isBrokerConnected = isBrokerConnected;
        ctrl.shutdownBroker = shutdownBroker;
        ctrl.connectBroker = connectBroker;

        ctrl.hasOpenProtocols = ParlayProtocolManager.hasOpenProtocols;
        ctrl.hasSavedProtocols = ParlayProtocolManager.hasSavedProtocols;
        ctrl.getOpenProtocols = ParlayProtocolManager.getOpenProtocols;
        ctrl.getSavedProtocols = ParlayProtocolManager.getSavedProtocols;
        ctrl.closeProtocol = ParlayProtocolManager.closeProtocol;
        ctrl.deleteSavedProtocol = ParlayProtocolManager.deleteProtocolConfiguration;
        ctrl.openSavedProtocol = openSavedProtocol;
        ctrl.openConfiguration = openConfiguration;

        // Attach reference to $mdMedia to scope so that media queries can be done.
        $scope.$mdMedia = $mdMedia;

        function isBrokerConnected () {
            return PromenadeBroker.connected;
        }

        function shutdownBroker () {
            PromenadeBroker.requestShutdown();
        }

        function connectBroker () {
            PromenadeBroker.connect();
        }

        function openSavedProtocol (configuration) {
            ctrl.connecting = true;
            ParlayProtocolManager.openProtocol(configuration).then(function () {
                ctrl.connecting = false;
            });
        }

        /**
         * Show protocol configuration dialog and have ParlayProtocolManager open a protocol.
         * @param {Event} - Event generated when button is selected. Allows use to have origin for dialog display animation.
         */
        /* istanbul ignore next */
        function openConfiguration (event) {
            // Show a configuration dialog allowing us to setup a protocol configuration.
            $mdDialog.show({
                targetEvent: event,
                clickOutsideToClose: true,
                onComplete: function (scope, element) {
                    element.find("input").focus();
                },
                controller: "ParlayProtocolConfigurationController",
                controllerAs: "ctrl",
                bindToController: true,
                templateUrl: "../parlay_components/protocols/directives/parlay-protocol-configuration-dialog.html"
            });
        }

    }

}());