function ParlayProtocolListController($scope, $mdDialog, $mdMedia, ParlayProtocolManager, PromenadeBroker) {
    
    this.hide = $mdDialog.hide;
    this.connecting = false;
    
    /**
     * Returns Broker connection status.
     * @returns {Boolean} Broker connection status
     */
    this.isBrokerConnected = function () {
        return PromenadeBroker.isConnected();
    };
    
    /**
     * Returns Broker location.
     * @returns {String} location of Broker where WebSocket is connected to.
     */
    this.getBrokerAddress = function () {
        return PromenadeBroker.getBrokerAddress();  
    };
    
    /**
     * Switches Broker connected and disconnected.
     */
    this.toggleBrokerConnection = function () {
        if (PromenadeBroker.isConnected()) PromenadeBroker.disconnect();
        else PromenadeBroker.connect();
    };
    
    /**
     * Returns open protocols from ParlayProtocolManager.
     * @returns {Array} open protocols
     */
    this.getOpenProtocols = function () {
        return ParlayProtocolManager.getOpenProtocols();
    };
    
	this.getSavedProtocols = function () {
		return ParlayProtocolManager.getSavedProtocols();
	};
	
	/**
     * Check if ParlayProtocolManager has saved protocols.
     * @returns {Boolean} true if open protocols exist, false otherwise.
     */
	this.hasSavedProtocols = function () {
		return this.getSavedProtocols().length !== 0;
	};
	
	this.openSavedProtocol = function (configuration) {
		this.connecting = true;
	    ParlayProtocolManager.openProtocol(configuration).finally(function () {
		    this.connecting = false;
	    }.bind(this));
    };
    
    this.deleteSavedProtocol = function (configuration) {
	  	ParlayProtocolManager.deleteProtocolConfiguration(configuration);  
    };
    
    /**
     * Check if ParlayProtocolManager has open protocols.
     * @returns {Boolean} true if open protocols exist, false otherwise.
     */
    this.hasOpenProtocols = function () {
        return this.getOpenProtocols().length !== 0;
    };
    
    /**
     * Closes protocol then spawns toast notifying user.
     * @param {Object} protocol - Protocol configuration object.
     */
    /* istanbul ignore next */
    this.closeProtocol = function (protocol) {
        ParlayProtocolManager.closeProtocol(protocol);
    };
    
    /* istanbul ignore next */
    this.viewProtocolDetails = function (event, protocol) {
        $mdDialog.show({
            targetEvent: event,
            clickOutsideToClose: true,
            controller: "ParlayProtocolDetailController",
            controllerAs: "ctrl",
            templateUrl: "../parlay_components/protocols/directives/parlay-protocol-details.html",
            locals: {
                protocol: protocol
            },
            fullscreen: !$mdMedia("gt-sm")
        });
    };
    
    /**
     * Show protocol configuration dialog and have ParlayProtocolManager open a protocol.
     * @param {Event} - Event generated when button is selected. Allows use to have origin for dialog display animation.
     */
    /* istanbul ignore next */
    this.openConfiguration = function (event) {
        // Show a configuration dialog allowing us to setup a protocol configuration.
        $mdDialog.show({
            targetEvent: event,
            clickOutsideToClose: true,
            onComplete: function (scope, element) { element.find("input").focus(); },
            controller: "ParlayProtocolConfigurationController",
            controllerAs: "ctrl",
            bindToController: true,
            templateUrl: "../parlay_components/protocols/directives/parlay-protocol-configuration-dialog.html",
            fullscreen: !$mdMedia("gt-sm")
        });
    };
    
    // Watch the size of the screen, if we are on a screen size that's greater than a small screen we should always display labels.
    $scope.$watch(function () {
        return $mdMedia("gt-md");
    }, function (large_screen) {
        $scope.large_screen = large_screen;
    });
    
}

angular.module("parlay.protocols.list_controller", ["parlay.protocols.configuration_controller", "parlay.protocols.detail_controller", "parlay.protocols.manager", "promenade.broker", "parlay.notification", "ngMaterial", "ngMessages", "ngMdIcons", "templates-main"])
	.controller("ParlayProtocolListController", ["$scope", "$mdDialog", "$mdMedia", "ParlayProtocolManager", "PromenadeBroker", ParlayProtocolListController]);