(function () {
    "use strict";

    var modules_dependencies = ["ngMaterial", "ngMessages", "ngMdIcons", "templates-main", "parlay.protocols.configuration_controller", "parlay.protocols.manager", "promenade.broker"];

    angular
        .module("parlay.protocols.list_controller", modules_dependencies)
        .controller("ParlayProtocolListController", ParlayProtocolListController);

    ParlayProtocolListController.$inject = ["$scope", "$mdDialog", "$mdMedia", "ParlayProtocolManager", "PromenadeBroker"];
    /**
     * Interfaces with [ParlayProtocolManager]{@link module:ParlayProtocol.ParlayProtocolManager} to allow end-user to
     * view connected and saved protocols.
     * @constructor module:ParlayProtocol.ParlayProtocolListController
     * @param {Object} $scope - AngularJS [$scope]{@link https://docs.angularjs.org/guide/scope} Object.
     * @param {Object} $mdDialog - Angular Material [$mdDialog]{@link https://material.angularjs.org/latest/api/service/$mdDialog} service.
     * @param {Object} $mdMedia - Angular Material [$mdMedia]{@link https://material.angularjs.org/latest/api/service/$mdMedia} service.
     * @param {Object} ParlayProtocolManager - [ParlayProtocolManager]{@link module:ParlayProtocol.ParlayProtocolManager} service.
     * @param {Object} PromenadeBroker - [PromenadeBroker]{@link module:PromenadeBroker.PromenadeBroker} service.
     */
    function ParlayProtocolListController($scope, $mdDialog, $mdMedia, ParlayProtocolManager, PromenadeBroker) {
        
        var ctrl = this;

        /**
         * True if connection request has been sent but connection success or failure has not been confirmed.
         * @member module:ParlayProtocol.ParlayProtocolListController#connecting
         * @public
         * @type {Boolean}
         */
        ctrl.connecting = false;
        ctrl.error = false;

        // Attach methods to controller.
        ctrl.isBrokerConnected = isBrokerConnected;
        ctrl.shutdownBroker = shutdownBroker;
        ctrl.connectBroker = connectBroker;
        ctrl.openConfiguration = openConfiguration;
        ctrl.openSavedProtocol = openSavedProtocol;

        // Attach $mdDialog.hide to controller to allow user to dismiss dialog.
        ctrl.hide = $mdDialog.hide;

        // Attach Broker methods to controller to allow user to access broker data.
        ctrl.getBrokerAddress = PromenadeBroker.getBrokerAddress;
        ctrl.broker_version = PromenadeBroker.version;

        // Attach ParlayProtocolManager methods to controller to allow user to manipulate protocol connections.
        ctrl.hasOpenProtocols = ParlayProtocolManager.hasOpenProtocols;
        ctrl.hasSavedProtocols = ParlayProtocolManager.hasSavedProtocols;
        ctrl.getOpenProtocols = ParlayProtocolManager.getOpenProtocols;
        ctrl.getSavedProtocols = ParlayProtocolManager.getSavedProtocols;
        ctrl.closeProtocol = ParlayProtocolManager.closeProtocol;
        ctrl.deleteSavedProtocol = ParlayProtocolManager.deleteProtocolConfiguration;

        // Attach reference to $mdMedia to scope so that media queries can be done.
        $scope.$mdMedia = $mdMedia;

        /**
         * True if [PromenadeBroker]{@link module:PromenadeBroker.PromenadeBroker} is connected, false otherwise.
         * @member module:ParlayProtocol.ParlayProtocolListController#isBrokerConnected
         * @public
         * @returns {Boolean}
         */
        function isBrokerConnected () {
            return PromenadeBroker.connected;
        }

        /**
         * Requests that the [PromenadeBroker]{@link module:PromenadeBroker.PromenadeBroker} shuts down.
         * @member module:ParlayProtocol.ParlayProtocolListController#shutdownBroker
         * @public
         */
        function shutdownBroker () {
            PromenadeBroker.requestShutdown();
        }

        /**
         * Attempts to connect to the [PromenadeBroker]{@link module:PromenadeBroker.PromenadeBroker}.
         * @member module:ParlayProtocol.ParlayProtocolListController#connectBroker
         * @public
         */
        function connectBroker () {
            PromenadeBroker.connect();
        }

        /**
         * Attempts to open a connection using the details stored in the configuration Object.
         * @member module:ParlayProtocol.ParlayProtocolListController#openSavedProtocol
         * @public
         * @param {Object} configuration - Details of a previous connection that can be used to open a new connection.
         */
        function openSavedProtocol (configuration) {
            ctrl.connecting = true;
            ParlayProtocolManager.openProtocol(configuration).then(function () {
                ctrl.connecting = false;
            }).catch(function (response) {
                ctrl.connecting = false;
                ctrl.error = true;
                ctrl.error_message = response;
                return response;
            });
        }

        /**
         * Show protocol configuration dialog and have
         * [ParlayProtocolManager]{@link module:ParlayProtocol.ParlayProtocolManager} open a protocol.
         * @member module:ParlayProtocol.ParlayProtocolListController#openConfiguration
         * @public
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