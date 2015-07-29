var protocols = angular.module('parlay.protocols', ['promenade.broker', 'ngMaterial', 'ngMessages', 'ngMdIcons', 'templates-main', 'promenade.protocols.directmessage']);

protocols.factory('ParlayProtocol', ['ParlaySocket', 'ParlayEndpoint', 'PromenadeBroker', '$q', function (ParlaySocket, ParlayEndpoint, PromenadeBroker, $q) {

    function NotImplementedError(method, name) {
        console.warn(method + ' is not implemented for ' + name);
    }
    
    function ParlayProtocol(configuration) {
        'use strict';
        this.protocol_name = configuration.name;
        this.type = configuration.protocol_type;
        
        this.available_endpoints = [];
        this.active_endpoints = [];
        this.log = [];        
        this.subscription_listener_dereg = null;        
        this.on_message_callbacks = [];
        
        this.endpoint_factory = ParlayEndpoint;
        
        this.fields = {};
    }
    
    ParlayProtocol.prototype.getName = function () {
        return this.protocol_name;
    };
    
    ParlayProtocol.prototype.getType = function () {
        return this.type;
    };
    
    ParlayProtocol.prototype.activateEndpoint = function (endpoint) {
        var index = this.available_endpoints.findIndex(function (suspect) {
            return endpoint === suspect;
        });
        
        if (index > -1) this.active_endpoints.push(this.available_endpoints.splice(index, 1)[0]);
        else throw endpoint.name + ' does not belong to ' + this.getName();
    };
    
    ParlayProtocol.prototype.getAvailableEndpoints = function () {
        return this.available_endpoints;
    };
    
    ParlayProtocol.prototype.getActiveEndpoints = function () {
        return this.active_endpoints;
    };
    
    ParlayProtocol.prototype.getLog = function () {
        return this.log;
    };        
    
    ParlayProtocol.prototype.onMessage = function (callback) {
        this.on_message_callbacks.push(callback.bind(this));    
    };
    
    ParlayProtocol.prototype.invokeCallbacks = function (response) {
        this.on_message_callbacks = this.on_message_callbacks.filter(function (callback) {
            callback(response);            
            return true;
        });
    };
    
    ParlayProtocol.prototype.subscribe = function () {
        PromenadeBroker.sendSubscribe(this.buildSubscriptionTopics()).then(function (response) {
            this.subscription_listener_dereg = ParlaySocket.onMessage(this.buildSubscriptionTopics().topics, this.invokeCallbacks.bind(this), true);
        }.bind(this));
    };
    
    ParlayProtocol.prototype.unsubscribe = function () {
        PromenadeBroker.sendUnsubscribe(this.buildSubscriptionTopics()).then(function (response) {
            this.onClose();
        }.bind(this));
    };
    
    ParlayProtocol.prototype.hasSubscription = function() {
        return this.subscription_listener_dereg !== null;
    };
    
    ParlayProtocol.prototype.recordLog = function(response) {
        this.log.push(response);
    };
    
    ParlayProtocol.prototype.sendMessage = function (topics, contents, response_topics) {
        return $q(function(resolve, reject) {
            ParlaySocket.sendMessage(topics, contents, response_topics, function (response) {
                if (response.status === 0) resolve(response);
                else reject(response);
            });
        }.bind(this));
    };
    
    ParlayProtocol.prototype.onOpen = function () {
        NotImplementedError('onOpen', this.getName());
    };
    
    ParlayProtocol.prototype.onClose = function () {
        if (this.hasSubscription()) {
            this.subscription_listener_dereg();
            this.subscription_listener_dereg = null;
        }
        this.available_endpoints = [];
        this.active_endpoints = [];
    };
    
    ParlayProtocol.prototype.buildFieldMethods = function (keys) {
        keys.forEach(function (key) {
            /* istanbul ignore else  */
            if (!this[key]) {
                Object.defineProperty(Object.getPrototypeOf(this), key, {
                    get: function() {
                        return this.fields[key];
                    }
                });    
            }            
        }, this);
    };
    
    ParlayProtocol.prototype.buildFields = function (info) {
        this.fields = Object.keys(info).filter(function (key) {
            // We should do some sort of filtering here.
            return true;
        }, this).reduce(function (accumulator, key) {
            accumulator[key] = info[key];
            return accumulator;
        }, {});
    };
    
    ParlayProtocol.prototype.getDynamicFieldKeys = function () {
        return Object.keys(this.fields);
    };
    
    ParlayProtocol.prototype.addEndpoints = function (endpoints) {
        this.available_endpoints = endpoints.map(function (endpoint) {
            return new this.endpoint_factory(endpoint, this);
        }, this);
    };
    
    ParlayProtocol.prototype.addDiscoveryInfo = function (info) {
        this.buildFields(info);
        this.buildFieldMethods(Object.keys(info));
        this.addEndpoints(info.CHILDREN);
    };
    
    ParlayProtocol.prototype.buildSubscriptionTopics = function () {
        NotImplementedError('buildSubscriptionTopics', this.getName());
    };  
    
    return ParlayProtocol;
}]);

protocols.factory('ProtocolManager', ['$injector', 'PromenadeBroker', '$q', function ($injector, PromenadeBroker, $q) {
    
    var Private = {
        open_protocols: [],
        available_protocols: []
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
        return Private.available_protocols;
    };
    
    /**
     * Returns cached open protocols.
     * @returns {Array} open protocols.
     */
    Public.getOpenProtocols = function () {
        return Private.open_protocols;
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
        return PromenadeBroker.closeProtocol(protocol.getName()).then(function (response) {
            if (response.status === 'ok') {
                // Search for open protocol requested to be closed.
                var index = Private.open_protocols.findIndex(function (suspect) {
                    return protocol.getName() === suspect.getName();
                });
                
                // Remove if we find the protocol, then call it's onClose method.
                /* istanbul ignore else */
                if (index > -1) Private.open_protocols.splice(index, 1)[0].onClose();
                
                return response;
            }
            else return $q.reject(response);
        });
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
     * 
     */
    Public.requestDiscovery = function () {
        return PromenadeBroker.requestDiscovery(true);
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
     * Return a open protocol with the given name.
     * @returns {Object} Returns Protocol object.
     */
    Private.getOpenProtocol = function (name) {
        return Private.open_protocols.find(function (protocol) {
            return name === protocol.getName();
        });
    };
    
    /**
     * Sets private attribute available to an Array of available protocols.
     * @param {Object} Map of protocol names : protocol details.
     */
    Private.setAvailableProtocols = function (protocols) {
        Private.available_protocols = Object.keys(protocols).map(function (protocol_name) {
            return {
                name: protocol_name,
                parameters: protocols[protocol_name].params.reduce(function (param_obj, current_param) {
                    param_obj[current_param] = {
                        value: null,
                        defaults: protocols[protocol_name].defaults[current_param]
                    };
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
        Private.open_protocols = protocols.map(function (configuration) {
            var protocol = $injector.has(configuration.protocol_type) ? $injector.get(configuration.protocol_type) : $injector.get('PromenadeDirectMessageProtocol');
            var instance = new protocol(configuration);
            instance.onOpen();
            return instance;
        });        
    };
    
    /**
     * Clears private attributes open and available.
     */
    Private.clearProtocols = function () {
        Private.open_protocols.forEach(function (protocol) {
            protocol.onClose();
        });
        Private.open_protocols = [];
        Private.available_protocols = [];
    };
    
    /**
     * Adds information from discovery to open Protocol instance.
     * @param {Object} info - Discovery information which may be vendor specific.
     */
    Private.addDiscoveryInfoToOpenProtocol = function (info) {
        Private.getOpenProtocol(info.NAME).addDiscoveryInfo(info);
    };    
    
    /**
     * PromenadeBroker callback registrations.
     */
    
    PromenadeBroker.onOpen(function () {
        Private.requestProtocols();
    });
    
    PromenadeBroker.onClose(function () {
        Private.clearProtocols();
    });
    
    PromenadeBroker.onMessage({type: 'broker', response: 'open_protocol_response'}, function (response) {
        Private.requestOpenProtocols();
    });
    
    PromenadeBroker.onMessage({type: 'broker', response: 'close_protocol_response'}, function (response) {
        Private.requestOpenProtocols();
    });
    
    PromenadeBroker.onMessage({type: 'broker', response: 'get_protocols_response'}, function (response) {
        Private.setAvailableProtocols(response);
    });
    
    PromenadeBroker.onMessage({type: 'broker', response: 'get_open_protocols_response'}, function (response) {
        Private.setOpenProtocols(response.protocols);
    });
    
    PromenadeBroker.onDiscovery(function (response) {
        response.discovery.forEach(Private.addDiscoveryInfoToOpenProtocol);
    });
    
    return Public;
}]);

protocols.controller('ProtocolConfigurationController', ['$scope', '$mdDialog', '$mdToast', 'ProtocolManager', function ($scope, $mdDialog, $mdToast, ProtocolManager) {
    
    $scope.selected_protocol = null;
    $scope.connecting = false;
    
    /**
     * Returns protocols that pass the filterFunction generated by the query string.
     * @param {String} query - name of potential protocol.
     * @returns {Array} filtered protocols.
     */
    $scope.filterProtocols = function (query) {
        var lowercaseQuery = angular.lowercase(query);
        return query ? ProtocolManager.getAvailableProtocols().filter(function(protocol) {
            return angular.lowercase(protocol.name).indexOf(lowercaseQuery) > -1;
        }) : ProtocolManager.getAvailableProtocols();
    };
    
    /**
     * Returns default options that pass the filterFunction generated by the query string.
     * @param {String} query - name of potential default.
     * @returns {Array} filtered default.
     */
    $scope.filterDefaults = function (defaults, query) {
        var lowercaseQuery = angular.lowercase(query);
        return query ? defaults.filter(function(default_string) {
            return angular.lowercase(default_string).indexOf(lowercaseQuery) > -1;
        }) : defaults;
    };
    
    /**
     * Checks if selected protocol has any configuration parameters.
     * @returns {Boolean} True if it has any parameters, false otherwise
     */
    $scope.selectedProtocolHasParameters = function () {
        return Object.keys($scope.selected_protocol.parameters).length > 0;
    };
    
    /**
     * Rejects the $mdDialog promise used to launch this controller.
     */
    /* istanbul ignore next */
    $scope.cancel = function () {
        $mdDialog.cancel();
    };
    
    /**
     * Resolves the $mdDialog promise with the a configured $scope.selected_protocol.
     * @returns {$q.defer.promise} Resolves the $mdDialog promise with the a configured $scope.selected_protocol.
     */
    $scope.connect = function () {        
        $scope.connecting = true;
        
        ProtocolManager.openProtocol({
            name: $scope.selected_protocol.name,
            parameters: Object.keys($scope.selected_protocol.parameters).reduce(function (param_obj, key) {
                            param_obj[key] = $scope.selected_protocol.parameters[key].value;
                            return param_obj;
                        }, {})
        }).then(function (response) {
            /* istanbul ignore next */
            $mdToast.show($mdToast.simple()
                .content('Connected to ' + response.name + '.')
                .action('Discover')
                .position('bottom left').hideDelay(3000)).then(function (result) {
                    if (result === 'ok') ProtocolManager.requestDiscovery(true);
                });
            $mdDialog.hide(response);
        }).catch(function (response) {
            $scope.connecting = false;
            $scope.error = true;
            $scope.error_message = response.status;
            return response;
        });
    };
    
}]);

protocols.controller('ParlayConnectionListController', ['$scope', '$mdDialog', '$mdToast', 'ProtocolManager', 'PromenadeBroker', function ($scope, $mdDialog, $mdToast, ProtocolManager, PromenadeBroker) {
    
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
    /* istanbul ignore next */
    $scope.closeProtocol = function (protocol) {
        ProtocolManager.closeProtocol(protocol).then(function (result) {
            $mdToast.show($mdToast.simple()
                .content('Closed ' + protocol.getName() + '.'));
        }).catch(function (result) {
            $mdToast.show($mdToast.simple()
                .content(result.status));  
        });
    };
    
    /* istanbul ignore next */
    $scope.viewProtocolConnectionDetails = function (event, protocol) {
        $mdDialog.show({
            targetEvent: event,
            clickOutsideToClose: true,
            controller: 'ProtocolConnectionDetailController',
            templateUrl: '../parlay_components/communication/directives/parlay-protocol-connection-details.html',
            locals: {
                protocol: protocol
            }
        });
    };
    
    /**
     * Show protocol configuration dialog and have ProtocolManager open a protocol.
     * @param {Event} - Event generated when button is selected. Allows use to have origin for dialog display animation.
     */
    /* istanbul ignore next */
    $scope.openConfiguration = function (event) {
        // Show a configuraton dialog allowing us to setup a protocol configuration.
        $mdDialog.show({
            targetEvent: event,
            clickOutsideToClose: true,
            controller: 'ProtocolConfigurationController',
            templateUrl: '../parlay_components/communication/directives/parlay-protocol-configuration-dialog.html'
        });
    };
    
}]);

protocols.controller('ProtocolConnectionDetailController', ['$scope', '$mdDialog', 'protocol', function ($scope, $mdDialog, protocol) {
    $scope.getProtocolName = function () {
        return protocol.getName();
    };
    
    $scope.getLog = function () {
        return protocol.getLog();
    };
    
    $scope.hasSubscription = function () {
        return protocol.hasSubscription();
    };
    
    $scope.toggleSubscription = function () {
        if (protocol.hasSubscription()) protocol.unsubscribe();
        else protocol.subscribe();
    };
    
    $scope.hide = $mdDialog.hide;
    
}]);

protocols.controller('ParlayConnectionStatusController', ['$scope', '$mdDialog', 'PromenadeBroker', function ($scope, $mdDialog, PromenadeBroker) {
    $scope.connection_icon = 'cloud_off';
    
    /* istanbul ignore next */
    $scope.viewConnections = function (event) {
        $mdDialog.show({
            targetEvent: event,
            clickOutsideToClose: true,
            controller: 'ParlayConnectionListController',
            templateUrl: '../parlay_components/communication/directives/parlay-connection-list-dialog.html'
        });
    };    
    
}]);

/* istanbul ignore next */
protocols.directive('parlayConnectionStatus', ['PromenadeBroker', function (PromenadeBroker) {
    return {
        scope: {},
        templateUrl: '../parlay_components/navigation/directives/parlay-connection-status.html',
        controller: 'ParlayConnectionStatusController',
        link: function ($scope, element, attributes) {
            $scope.$watch(function () {
                return PromenadeBroker.isConnected();
            }, function (connected) {
                $scope.connection_icon = connected ? 'cloud' : 'cloud_off';
            });
        }
    };
}]);