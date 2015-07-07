var protocols = angular.module('parlay.protocols', ['promenade.broker', 'bit.sscom', 'ngMaterial', 'ngMessages', 'ngMdIcons', 'templates-main']);

protocols.run(['ProtocolManager', function (ProtocolManager) {
    ProtocolManager.requestOpenProtocols();  
}]);

protocols.factory('ProtocolManager', ['Protocol', '$timeout', 'PromenadeBroker', function (Protocol, $timeout, PromenadeBroker) {
    
    var Private = {
        open: [],
        available: []
    };
    
    var Public = {};
    
    Public.getOpenProtcols = function () {
        return Private.open;
    };
    
    Public.openProtocol = function (configuration) {
        return PromenadeBroker.openProtocol(configuration).then(function (response) {
            PromenadeBroker.sendRequest('get_open_protocols', {});
            return response;
        });
    };
    
    Public.closeProtocol = function (protocol) {
        return PromenadeBroker.closeProtocol(protocol);
    };
    
    Public.requestOpenProtocols = function () {
        return PromenadeBroker.requestOpenProtocols();
    };
    
    Public.requestAvailableProtocols = function () {
        return PromenadeBroker.requestAvailableProtocols();
    };
    
    Public.requestDiscovery = function (is_forced) {
        return PromenadeBroker.requestDiscovery(is_forced);
    };
    
    Private.hasOpenProtocol = function (name) {
        return Private.getOpenProtocol(name) !== undefined;
    };
    
    Private.getOpenProtocol = function () {
        return Private.open.find(function (protocol) {
            return name === protocol.name;
        });
    };
    
    Private.setOpenProtocol = function (protocol) {
        if (!Private.hasOpenProtocol(protocol.name)) Private.open.push(Protocol(protocol));
    };
    
    PromenadeBroker.onMessage({type: 'broker', response: 'get_open_protocols_response'}, function (response) {
        response.protocols.forEach(function (protocol) {
            Private.setOpenProtocol(protocol);
        });
    });
    
    PromenadeBroker.onDiscovery(function (response) {
        response.discovery.forEach(function (protocol) {
            Private.open.find(function (element) {
                return element.name === protocol.name;
            }).addDiscovery(protocol);
        });
    });
    
    return Public;
}]);

protocols.controller('ProtocolConnectionController', ['$scope', '$mdDialog', '$mdToast', 'ProtocolManager', function ($scope, $mdDialog, $mdToast, ProtocolManager) {
    $scope.hide = $mdDialog.hide;
    
    $scope.getOpenProtocols = function () {
        return ProtocolManager.getOpenProtcols();
    };
    
    $scope.hasOpenProtocols = function () {
        return ProtocolManager.getOpenProtcols().length !== 0;
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
     * Show protocol configuration dialog and have EndpointManager open a protocol.
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
        }).catch(function () {
            // Do nothing as the user has clicked outside of the dialog.
        }).then(function (response) {
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
    
}]);

protocols.controller('ProtocolConfigurationController', ['$scope', '$mdDialog', 'ProtocolManager', function ($scope, $mdDialog, ProtocolManager) {
    
    $scope.search_text = "";
    $scope.selected_protocol = null;
        
    $scope.configuration = {};
    
    $scope.selectProtocol = function (protocol) {
        $scope.configuration.protocol = protocol;
    };
    
    $scope.querySearch = function (query) {
        return ProtocolManager.requestAvailableProtocols().then(function (protocols) {
            return query ? protocols.filter(filterFunction(query)) : protocols;
        });
    };
    
    function filterFunction(query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(protocol) {
            return angular.lowercase(protocol.name).indexOf(lowercaseQuery) >= 0;
        };
    }
    
    $scope.cancel = function () {
        $mdDialog.cancel();
    };
    
    $scope.accept = function () {
        $mdDialog.hide($scope.configuration);
    };
    
}]);