var protocols = angular.module('parlay.protocols', ['promenade.broker', 'bit.sscom', 'ngMaterial', 'ngMessages', 'ngMdIcons', 'templates-main']);

protocols.factory('ProtocolManager', ['PromenadeBroker', function (PromenadeBroker) {
    
    var Private = {
        broker: PromenadeBroker,
        open: [],
        available: []
    };
    
    var Public = {};
    
    Public.openProtocol = function (configuration) {
        return Private.broker.openProtocol(configuration);
    };
    
    Public.closeProtocol = function (protocol) {
        return Private.broker.closeProtocol(protocol);
    };
    
    Public.requestOpenProtocols = function () {
        return Private.broker.requestOpenProtocols();
    };
    
    Public.requestAvailableProtocols = function () {
        return Private.broker.requestAvailableProtocols();
    };
    
    return Public;
}]);

protocols.controller('ProtocolConnectionController', ['$scope', '$mdDialog', '$mdToast', 'ProtocolManager', function ($scope, $mdDialog, $mdToast, ProtocolManager) {
    $scope.hide = $mdDialog.hide;
    
    $scope.cached_protocols = [];    
    
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
            // If configuration is undefined that means we hide the dialog without generating a configuration and should not attempt opening.
            if (configuration !== undefined) return ProtocolManager.openProtocol(configuration);
            else return undefined;
        }).then(function (response) {
            // Don't display anything if we didn't open a protocol.
            if (response === undefined) return;
            $mdToast.show($mdToast.simple()
                .content('Connected successfully to protocol.')
                .position('bottom left').hideDelay(3000));
        }, function (response) {
            $mdToast.show($mdToast.simple()
                .content('Failed to make protocol connection.')
                .position('bottom left').hideDelay(3000));
        });        
    };
    
    ProtocolManager.requestOpenProtocols().then(function (protocols) {
        $scope.cached_protocols = protocols;
    });
    
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
        $mdDialog.hide();
    };
    
    $scope.accept = function () {
        $mdDialog.hide($scope.configuration);
    };
    
}]);