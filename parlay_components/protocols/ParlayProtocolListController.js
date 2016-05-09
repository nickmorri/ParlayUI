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

        ctrl.isBrokerConnected = isBrokerConnected;
        ctrl.getBrokerAddress = PromenadeBroker.getBrokerAddress;
        ctrl.broker_version = PromenadeBroker.version;
        ctrl.shutdownBroker = shutdownBroker;
        ctrl.connectBroker = connectBroker;

        ctrl.openSavedProtocol = openSavedProtocol;
        ctrl.hasOpenProtocols = hasOpenProtocols;
        ctrl.hasSavedProtocols = hasSavedProtocols;
        ctrl.openConfiguration = openConfiguration;
        ctrl.getOpenProtocols = getOpenProtocols;
        ctrl.getSavedProtocols = getSavedProtocols;
        ctrl.deleteSavedProtocol = deleteSavedProtocol;
        ctrl.closeProtocol = closeProtocol;

        // Attach reference to $mdMedia to scope so that media queries can be done.
        $scope.$mdMedia = $mdMedia;

        function isBrokerConnected () {
            return PromenadeBroker.connected;
        }

        function shutdownBroker () {
            /* istanbul ignore else */
            if (PromenadeBroker.connected) {
                PromenadeBroker.requestShutdown();
            }
        }

        function connectBroker () {
            /* istanbul ignore else */
            if (!PromenadeBroker.connected) {
                PromenadeBroker.connect();
            }
        }

        function getOpenProtocols () {
            return ParlayProtocolManager.getOpenProtocols();
        }

        function getSavedProtocols () {
            return ParlayProtocolManager.getSavedProtocols();
        }

        function deleteSavedProtocol (configuration) {
            return ParlayProtocolManager.deleteProtocolConfiguration(configuration);
        }

        function closeProtocol (protocol) {
            return ParlayProtocolManager.closeProtocol(protocol);
        }


        function hasOpenProtocols () {
            return ParlayProtocolManager.hasOpenProtocols();
        }

        function hasSavedProtocols () {
            return ParlayProtocolManager.hasSavedProtocols();
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