var protocols = angular.module('parlay.protocols', ['promenade.broker', 'ngMaterial', 'ngMessages', 'ngMdIcons', 'templates-main']);

protocols.factory('Protocol', function () {
    var Private = {};
    
    return function (configuration) {
        
        var Public = {
            name: configuration.name,
            type: configuration.protocol_type
        };
        
        return Public;        
    };
});

protocols.factory('ProtocolManager', ['Protocol', 'PromenadeBroker', '$q', function (Protocol, PromenadeBroker, $q) {
    
    var Private = {
        open: [],
        available: []
    };
    
    var Public = {};
    
    /**
     * Public Methods
     */
    
    /**
     * Returns cached available protocols.
     * @returns {Array} available protocols.
     */
    Public.getAvailableProtocols = function () {
        return Private.available;
    };
    
    /**
     * Returns cached open protocols.
     * @returns {Array} open protocols.
     */
    Public.getOpenProtocols = function () {
        return Private.open;
    };
    
    /**
     * Requests the Broker to open a protocol.
     * @param {Object} configuration - Contains protocol configuration parameters.
     * @returns {$q.defer.promise} Resolved when the Broker responds with the open result.
     */
    Public.openProtocol = function (configuration) {
        return PromenadeBroker.openProtocol(configuration);
    };
    
    /**
     * Requests the Broker to close a protocol.
     * @param {Object} protocol - The protocol to be closed
     * @returns {$q.defer.promise} Resolved when the Broker responds with the close result.
     */
    Public.closeProtocol = function (protocol) {
        return PromenadeBroker.closeProtocol(protocol);
    };
    
    /**
     * Private Methods
     */
    
    /**
     * Requests both available and open protocols.
     * @returns {$q.defer.promise} Resolved when both request responses are received.
     */
    Private.requestProtocols = function () {
        return $q.all([Private.requestAvailableProtocols(), Private.requestOpenProtocols()]);
    };
    
    /**
     * Requests available protocols.
     * @returns {$q.defer.promise} Resolved when request response is recieved.
     */
    Private.requestAvailableProtocols = function () {
        return PromenadeBroker.requestAvailableProtocols();
    };
    
    /**
     * Requests open protocols.
     * @returns {$q.defer.promise} Resolved when request response is recieved.
     */
    Private.requestOpenProtocols = function () {
        return PromenadeBroker.requestOpenProtocols();
    };    
    
    /**
     * Check if a protocol is opened with the given name.
     * @returns {Boolean} Returns true if it does, false if it doesn't.
     */
    Private.hasOpenProtocol = function (name) {
        return Private.getOpenProtocol(name) !== undefined;
    };
    
    /**
     * Check if a protocol is available with the given name.
     * @returns {Boolean} Returns true if it does, false if it doesn't.
     */
    Private.hasAvailableProtocol = function (name) {
        return Private.getAvailableProtocol(name) !== undefined;
    };
    
    /**
     * Return a open protocol with the given name.
     * @returns {Object} Returns Protocol object.
     */
    Private.getOpenProtocol = function (name) {
        return Private.open.find(function (protocol) {
            return name === protocol.name;
        });
    };
    
    /**
     * Return a available protocol with the given name.
     * @returns {Object} Returns protocol configuration object.
     */
    Private.getAvailableProtocol = function (name) {
        return Private.available.find(function (protocol) {
            return name === protocol.name;
        });
    };
    
    /**
     * Sets private attribute available to an Array of available protocols.
     * @param {Object} Map of protocol names : protocol details.
     */
    Private.setAvailableProtocols = function (protocols) {
        Private.available = Object.keys(protocols).map(function (protocol_name) {
            return {
                name: protocol_name,
                parameters: protocols[protocol_name].params.reduce(function (param_obj, current_param) {
                    param_obj[current_param] = protocols[protocol_name].defaults[current_param];
                    return param_obj;
                }, {})
            };
        });
    };
    
    /**
     * Sets private attribute open to an Array of open protocols.
     * @param {Array} Array of open protocols.
     */
    Private.setOpenProtocols = function (protocols) {
        Private.open = protocols.map(function (protocol) {
            return Protocol(protocol);
        });        
    };
    
    /**
     * Clears private attributes open and available.
     */
    Private.clearProtocols = function () {
        Private.open = [];
        Private.available = [];
    };
    
    
    /**
     * PromenadeBroker callback registrations.
     */
    
    PromenadeBroker.onOpen(Private.requestProtocols);
    
    PromenadeBroker.onClose(Private.clearProtocols);
    
    PromenadeBroker.onMessage({type: 'broker', response: 'open_protocol_response'}, function (response) {
        PromenadeBroker.sendRequest('get_open_protocols', {});
    });
    
    PromenadeBroker.onMessage({type: 'broker', response: 'close_protocol_response'}, function (response) {
        PromenadeBroker.sendRequest('get_open_protocols', {});
    });
    
    PromenadeBroker.onMessage({type: 'broker', response: 'get_protocols_response'}, function (response) {
        Private.setAvailableProtocols(response);
    });
    
    PromenadeBroker.onMessage({type: 'broker', response: 'get_open_protocols_response'}, function (response) {
        Private.setOpenProtocols(response.protocols);
    });
    
    return Public;
}]);

protocols.controller('ProtocolConnectionController', ['$scope', '$mdDialog', '$mdToast', 'ProtocolManager', function ($scope, $mdDialog, $mdToast, ProtocolManager) {
    $scope.hide = $mdDialog.hide;
    
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
    
    /**
     * Returns a protocols that pass the filterFunction generated by the query string.
     * @param {String} query - name of potential protocol.
     * @returns {Array} filtered protocols.
     */
    $scope.querySearch = function (query) {
        return query ? ProtocolManager.getAvailableProtocols().filter(filterFunction(query)) : ProtocolManager.getAvailableProtocols();
    };
    
    /**
     * Builds a filter function with the query string.
     * @param {String} query - name of protocol by which to build the filterFunction. 
     * @returns {Function} function which will filter protocols by the query string.
     */    
    function filterFunction(query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(protocol) {
            return angular.lowercase(protocol.name).indexOf(lowercaseQuery) >= 0;
        };
    }
    
    /**
     * Rejects the $mdDialog promise.
     * @returns {$q.defer.promise} Rejects $mdDialog promise.
     */
    $scope.cancel = function () {
        $mdDialog.cancel();
    };
    
    /**
     * Resolves the $mdDialog promise with the a configured $scope.selected_protocol.
     * @returns {$q.defer.promise} Resolves the $mdDialog promise with the a configured $scope.selected_protocol.
     */
    $scope.accept = function () {
        $mdDialog.hide($scope.selected_protocol);
    };
    
}]);