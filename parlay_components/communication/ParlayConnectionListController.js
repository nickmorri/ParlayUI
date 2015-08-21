var list_controller = angular.module('parlay.protocols.list_controller', ['parlay.protocols.configuration_controller', 'parlay.protocols.detail_controller', 'parlay.protocols.manager', 'promenade.broker', 'parlay.notification', 'ngMaterial', 'ngMessages', 'ngMdIcons', 'templates-main']);

list_controller.controller('ParlayConnectionListController', ['$scope', '$mdDialog', 'ParlayNotification', 'ProtocolManager', 'PromenadeBroker', function ($scope, $mdDialog, ParlayNotification, ProtocolManager, PromenadeBroker) {
    
    $scope.hide = $mdDialog.hide;
    
    /**
     * Returns Broker connection status.
     * @returns {Boolean} Broker connection status
     */
    $scope.isBrokerConnected = function () {
        return PromenadeBroker.isConnected();
    };
    
    /**
     * Returns Broker location.
     * @returns {String} location of Broker where WebSocket is connected to.
     */
    $scope.getBrokerAddress = function () {
        return PromenadeBroker.getBrokerAddress();  
    };
    
    /**
     * Switches Broker connected and disconnected.
     */
    $scope.toggleBrokerConnection = function () {
        if (PromenadeBroker.isConnected()) PromenadeBroker.disconnect();
        else PromenadeBroker.connect();
    };
    
    /**
     * Returns open protocols from ParlayProtocolManager.
     * @returns {Array} open protocols
     */
    $scope.getOpenProtocols = function () {
        return ProtocolManager.getOpenProtocols();
    };
    
    /**
     * Check if ParlayProtocolManager has open protocols.
     * @returns {Boolean} true if open protocols exist, false otherwise.
     */
    $scope.hasOpenProtocols = function () {
        return ProtocolManager.getOpenProtocols().length !== 0;
    };
    
    /**
     * Closes protocol then spawns toast notifying user.
     * @param {Object} protocol - Protocol configuration object.
     */
    /* istanbul ignore next */
    $scope.closeProtocol = function (protocol) {
        ProtocolManager.closeProtocol(protocol).then(function (result) {
            ParlayNotification.show({
                content: 'Closed ' + protocol.getName() + '.'
            }); 
        }).catch(function (result) {
            ParlayNotification.show({
                content: result.STATUS
            });
        });
    };
    
    /* istanbul ignore next */
    $scope.viewProtocolConnectionDetails = function (event, protocol) {
        $mdDialog.show({
            targetEvent: event,
            clickOutsideToClose: true,
            controller: 'ParlayProtocolConnectionDetailController',
            templateUrl: '../parlay_components/communication/directives/parlay-protocol-connection-details.html',
            locals: {
                protocol: protocol
            }
        });
    };
    
    /**
     * Show protocol configuration dialog and have ParlayProtocolManager open a protocol.
     * @param {Event} - Event generated when button is selected. Allows use to have origin for dialog display animation.
     */
    /* istanbul ignore next */
    $scope.openConfiguration = function (event) {
        // Show a configuraton dialog allowing us to setup a protocol configuration.
        $mdDialog.show({
            targetEvent: event,
            clickOutsideToClose: true,
            onComplete: function (scope, element, options) {
	            element.find('input').focus();
            },
            controller: 'ParlayProtocolConfigurationController',
            templateUrl: '../parlay_components/communication/directives/parlay-protocol-configuration-dialog.html'
        });
    };
    
}]);