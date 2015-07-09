var navigation = angular.module('parlay.navigation', ['ui.router', 'ngMaterial', 'ngMdIcons', 'promenade.broker', 'parlay.protocols', 'templates-main']);

navigation.value('parlayNavToggleOpen', true);

navigation.controller('parlayToolbarController', ['$scope', '$state', '$mdSidenav', '$mdMedia', 'parlayNavToggleOpen', function ($scope, $state, $mdSidenav, $mdMedia, parlayNavToggleOpen) {
    
    // Allows view to access information from $state object. Using $current.self.name for display in toolbar
    $scope.$state = $state;
    
    // If we are on a screen size greater than the medium layout breakpoint we should open the navigation menu by default
    $scope.parlayNavToggleOpen = $mdMedia('gt-md');
    
    // Toggle the boolean holding the navigation menu open
    $scope.toggleMenu = function () {
        $scope.parlayNavToggleOpen = !$scope.parlayNavToggleOpen;
    };
    
    // If the media query for greater than medium screen size breakpoint is false we should collapse the menu
    $scope.$watch(function () {
        return $mdMedia('gt-md');
    }, function (greater_than) {
        if (!greater_than && $mdSidenav('parlayNavMenu').isLockedOpen()) $scope.toggleMenu();
    });    
    
}]);

navigation.controller('parlayNavController', ['$scope', '$state', '$rootScope', 'parlayNavToggleOpen', function ($scope, $state, $rootScope, parlayNavToggleOpen) {
            
    $scope.parlayNavToggleOpen = parlayNavToggleOpen;
    
    // Will be set to true after first successful state change
    $scope.initialStateChange = false;
    
    // Default icons
    $scope.fetchIcon = function (state) {
        var icons = {
            'endpoints': 'extension',
            'editor': 'create',
            'console': 'message'
        };
        
        if (icons.hasOwnProperty(state)) return icons[state];
        else return '';
    };
    
    // Retrieve and format state information to build navigation elements
    $scope.buildNavFromStates = function () {
        var excluded = ['settings', 'help'];
        return $state.get().filter(function (state) {
            return !state.abstract && excluded.indexOf(state.name) === -1;
        }).map(function (state) {
            return {
                name: state.name,
                route: state.name,
                icon: $scope.fetchIcon(state.name)
            };
        });
    };
    
    // Retrieve states so we can dynamically build navigation menu
    $scope.states = $scope.buildNavFromStates();
    
    // Close navigation menu after successful state change
    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        if (!$scope.initialStateChange) {
            $scope.initialStateChange = true;
            return;
        }
        
        $scope.parlayNavToggleOpen = false;
    });
}]);

navigation.controller('ParlayConnectionListController', ['$scope', '$mdDialog', '$mdToast', 'ProtocolManager', 'PromenadeBroker', function ($scope, $mdDialog, $mdToast, ProtocolManager, PromenadeBroker) {
    
    $scope.hide = $mdDialog.hide;
    $scope.connection_icon = 'cloud_off';
    
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
     * Returns open protocols from ProtocolManager.
     * @returns {Array} open protocols
     */
    $scope.getOpenProtocols = function () {
        return ProtocolManager.getOpenProtocols();
    };
    
    /**
     * Check if ProtocolManager has open protocols.
     * @returns {Boolean} true if open protocols exist, false otherwise.
     */
    $scope.hasOpenProtocols = function () {
        return ProtocolManager.getOpenProtocols().length !== 0;
    };
    
    /**
     * Closes protocol then spawns toast notifying user.
     * @param {Object} protocol - Protocol configuration object.
     */
    $scope.closeProtocol = function (protocol) {
        ProtocolManager.closeProtocol(protocol).then(function (result) {
            $mdToast.show($mdToast.simple()
                .content('Closed ' + protocol.name + "."));
        });
    };
    
    /**
     * Show protocol configuration dialog and have ProtocolManager open a protocol.
     * @param {Event} - Event generated when button is selected. Allows use to have origin for dialog display animation.
     */
    $scope.openConfiguration = function (event) {
        $mdDialog.hide();
        // Show a configuraton dialog allowing us to setup a protocol configuration.
        $mdDialog.show({
            targetEvent: event,
            controller: 'ProtocolConfigurationController',
            templateUrl: '../parlay_components/communication/directives/parlay-protocol-configuration-dialog.html',
        }).then(function (configuration) {
            return ProtocolManager.openProtocol(configuration);
        }).catch(function (result) {
            return undefined;
        }).then(function (response) {
            if (response === undefined) return response;
            // Don't display anything if we didn't open a protocol.
            $mdToast.show($mdToast.simple()
                .content('Connected successfully to protocol.')
                .position('bottom left').hideDelay(3000));
        }, function (response) {
            $mdToast.show($mdToast.simple()
                .content('Failed to make protocol connection.')
                .position('bottom left').hideDelay(3000));
        });        
    };
    
    $scope.$watch(function () {
        return PromenadeBroker.isConnected();
    }, function (connected) {
        $scope.connection_icon = connected ? 'cloud' : 'cloud_off';
    });
    
}]);

navigation.controller('ParlayConnectionStatusController', ['$scope', '$mdDialog', 'PromenadeBroker', function ($scope, $mdDialog, PromenadeBroker) {
    $scope.connection_icon = 'cloud_off';
        
    $scope.viewConnections = function (event) {
        $mdDialog.show({
            targetEvent: event,
            clickOutsideToClose: true,
            controller: 'ParlayConnectionListController',
            templateUrl: '../parlay_components/navigation/directives/parlay-connection-list-dialog.html'
        });
    };
    
    $scope.$watch(function () {
        return PromenadeBroker.isConnected();
    }, function (connected) {
        $scope.connection_icon = connected ? 'cloud' : 'cloud_off';
    });
}]);

navigation.directive('parlayConnectionStatus', function (PromenadeBroker) {
    return {
        scope: {},
        templateUrl: '../parlay_components/navigation/directives/parlay-connection-status.html',
        controller: 'ParlayConnectionStatusController'
    };
});

/* istanbul ignore next */
navigation.directive('parlayToolbar', function () {
    return {
        templateUrl: '../parlay_components/navigation/directives/parlay-toolbar.html',
        controller: 'parlayToolbarController'
    };
});

/* istanbul ignore next */
navigation.directive('parlayNav', function () {
    return {
        templateUrl: '../parlay_components/navigation/directives/parlay-navigation.html',
        replace: true,
        controller: 'parlayNavController'
    };
});