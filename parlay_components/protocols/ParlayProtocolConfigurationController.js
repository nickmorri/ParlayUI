(function () {
    "use strict";

    var module_dependencies = ["parlay.protocols.manager", "ngMaterial", "ngMessages", "ngMdIcons", "templates-main"];

    angular
        .module("parlay.protocols.configuration_controller", module_dependencies)
        .controller("ParlayProtocolConfigurationController", ParlayProtocolConfigurationController);

    ParlayProtocolConfigurationController.$inject = ["$scope", "$mdDialog", "$mdMedia", "ParlayProtocolManager"];
    function ParlayProtocolConfigurationController ($scope, $mdDialog, $mdMedia, ParlayProtocolManager) {

        this.selected_protocol = null;

        this.connecting = false;
        this.error = false;

        /**
         * Returns protocols that pass the filterFunction generated by the query string.
         * @param {String} query - name of potential protocol.
         * @returns {Array} filtered protocols.
         */
        this.filterProtocols = function (query) {
            var lowercaseQuery = angular.lowercase(query);
            var protocols = angular.copy(ParlayProtocolManager.getAvailableProtocols());

            return query ? protocols.filter(function(protocol) {
                return angular.lowercase(protocol.name).indexOf(lowercaseQuery) > -1;
            }) : protocols;
        };

        /**
         * Returns default options that pass the filterFunction generated by the query string.
         * @param {Array} defaults - Array of possible default values.
         * @param {String} query - name of potential default.
         * @returns {Array} filtered default.
         */
        this.filterDefaults = function (defaults, query) {
            var lowercaseQuery = angular.lowercase(query);
            return query ? defaults.filter(function(default_string) {
                return angular.lowercase(default_string).indexOf(lowercaseQuery) > -1;
            }) : defaults;
        };

        /**
         * Checks if selected protocol has any configuration parameters.
         * @returns {Boolean} True if it has any parameters, false otherwise
         */
        this.selectedProtocolHasParameters = function () {
            return this.selected_protocol !== null && this.selected_protocol !== undefined && Object.keys(this.selected_protocol.parameters).length > 0;
        };

        /**
         * Checks if the given item is a container type object.
         * @param {Object} item - Given item.
         * @returns {Boolean} - True if container, false otherwise.
         */
        this.isContainer = function (item) {
            return item !== null && item !== undefined && !angular.isString(item) && angular.isNumber(item.length);
        };

        /**
         * Rejects the $mdDialog promise used to launch this controller.
         */
        /* istanbul ignore next */
        this.cancel = function () {
            $mdDialog.cancel();
        };

        /**
         * Resolves the $mdDialog promise with the a configured this.selected_protocol.
         * @returns {$q.defer.promise} Resolves the $mdDialog promise with the a configured $scope.selected_protocol.
         */
        this.connect = function () {
            this.connecting = true;
            var protocol_name = ctrl.selected_protocol.name;
            var protocol_parameters = Object.keys(ctrl.selected_protocol.parameters).reduce(function (accumulator, key) {
                accumulator[key] = ctrl.selected_protocol.parameters[key].value ||
                    ctrl.selected_protocol.parameters[key].search_text;;
                return accumulator;
            }, {});

            ParlayProtocolManager.openProtocol({
                name: protocol_name,
                parameters: protocol_parameters
            }).then(function (response) {
                $mdDialog.hide(response);
                return response;
            }).catch(function (response) {
                this.connecting = false;
                this.error = true;
                this.error_message = response.STATUS;
                return response;
            }.bind(this));
        };

        // Attach reference to $mdMedia to scope so that media queries can be done.
        $scope.$mdMedia = $mdMedia;

    }

}());