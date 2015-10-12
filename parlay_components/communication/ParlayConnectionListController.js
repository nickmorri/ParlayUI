function ParlayConnectionListController($scope, $mdDialog, $mdMedia, ParlayProtocolManager, PromenadeBroker) {
    
    $scope.hide = $mdDialog.hide;
    $scope.connecting = false;
    
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
        return ParlayProtocolManager.getOpenProtocols();
    };
    
	$scope.getSavedProtocols = function () {
		return ParlayProtocolManager.getSavedProtocols();
	};
	
	/**
     * Check if ParlayProtocolManager has saved protocols.
     * @returns {Boolean} true if open protocols exist, false otherwise.
     */
	$scope.hasSavedProtocols = function () {
		return $scope.getSavedProtocols().length !== 0;
	};
	
	$scope.openSavedProtocol = function (configuration) {
		$scope.connecting = true;
	    ParlayProtocolManager.openProtocol(configuration).finally(function (response) {
		    $scope.connecting = false;
	    });
    };
    
    $scope.deleteSavedProtocol = function (configuration) {
	  	ParlayProtocolManager.deleteProtocolConfiguration(configuration);  
    };
    
    /**
     * Check if ParlayProtocolManager has open protocols.
     * @returns {Boolean} true if open protocols exist, false otherwise.
     */
    $scope.hasOpenProtocols = function () {
        return $scope.getOpenProtocols().length !== 0;
    };
    
    /**
     * Closes protocol then spawns toast notifying user.
     * @param {Object} protocol - Protocol configuration object.
     */
    /* istanbul ignore next */
    $scope.closeProtocol = function (protocol) {
        ParlayProtocolManager.closeProtocol(protocol);
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
    
    // Watch the size of the screen, if we are on a screen size that's greater than a small screen we should always display labels.
    $scope.$watch(function () {
        return $mdMedia('gt-sm');
    }, function (large_screen) {
        $scope.large_screen = large_screen;
    });
    
}

angular.module('parlay.protocols.list_controller', ['parlay.protocols.configuration_controller', 'parlay.protocols.detail_controller', 'parlay.protocols.manager', 'promenade.broker', 'parlay.notification', 'ngMaterial', 'ngMessages', 'ngMdIcons', 'templates-main'])
	.controller('ParlayConnectionListController', ['$scope', '$mdDialog', '$mdMedia', 'ParlayProtocolManager', 'PromenadeBroker', ParlayConnectionListController]);