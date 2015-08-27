var configuration_controller = angular.module('parlay.protocols.configuration_controller', ['parlay.protocols.manager', 'ngMaterial', 'ngMessages', 'ngMdIcons', 'templates-main', 'parlay.notification']);

configuration_controller.controller('ParlayProtocolConfigurationController', ['$scope', '$mdDialog', 'ParlayProtocolManager', 'ParlayNotification', function ($scope, $mdDialog, ParlayProtocolManager, ParlayNotification) {
    
    $scope.selected_protocol = null;
    $scope.connecting = false;
    
    /**
     * Returns protocols that pass the filterFunction generated by the query string.
     * @param {String} query - name of potential protocol.
     * @returns {Array} filtered protocols.
     */
    $scope.filterProtocols = function (query) {
        var lowercaseQuery = angular.lowercase(query);
        var protocols = angular.copy(ParlayProtocolManager.getAvailableProtocols());
        
        return query ? protocols.filter(function(protocol) {
            return angular.lowercase(protocol.name).indexOf(lowercaseQuery) > -1;
        }) : protocols;
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
        return $scope.selected_protocol !== null && $scope.selected_protocol !== undefined && Object.keys($scope.selected_protocol.parameters).length > 0;
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
        
        ParlayProtocolManager.openProtocol({
            name: $scope.selected_protocol.name,
            parameters: Object.keys($scope.selected_protocol.parameters).reduce(function (param_obj, key) {
                            param_obj[key] = $scope.selected_protocol.parameters[key].value;
                            return param_obj;
                        }, {})
        }).then(function (response) {
            /* istanbul ignore next */
            ParlayNotification.show({
                content: 'Connected to ' + response.name + '.',
                action: {
                    text: 'Discover',
                    callback: function () {
                        ParlayProtocolManager.requestDiscovery(true);
                    }
                }
            });
            $mdDialog.hide(response);
        }).catch(function (response) {
            $scope.connecting = false;
            $scope.error = true;
            $scope.error_message = response.STATUS;
            return response;
        });
    };
    
}]);