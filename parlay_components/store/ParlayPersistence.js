function ParlayPersistenceFactory(ParlayStore) {

    /**
     * Given a key that belongs to the given scope search for the parent that belongs to the key.
     * Example: 'message.data.speed' returns the data Object on message.
     * @param {Object} parent - Object or Angular scope to search for the parent of the key on.
     * @param {String} key - Name of a potentially nested attribute whose parent we are looking for.
     */
    function find_parent(key, parent) {
        var split_key = key.split('.');
        if (parent === undefined || parent === null) return undefined;
        else if (split_key.length === 1 && parent.hasOwnProperty(split_key[0])) return parent;
        else if (split_key.length > 1 && parent.hasOwnProperty(split_key[0])) return find_parent(split_key.slice(1).join('.'), parent[split_key[0]]);
        else return undefined;
    }

    /**
     * Given a key and a base scope we will search up the scope tree looking for the scope that has our scope object.
     * @param {String} key - attribute we are searching for on the scope/
     * @param {Object} scope - Angular scope to search for the key on.
     */
    function find_scope(key, scope) {
        var scope_attribute = key.split('.')[0];
        if (scope === undefined || scope === null) return undefined;
        else if (scope.hasOwnProperty(scope_attribute)) return scope;
        else if (scope.hasOwnProperty("$parent")) return find_scope(key, scope.$parent);
        else return undefined;
    }

    /**
     * Parlay service for persistence of directive $scope attributes to ParlayStore.
     * @constructor
     */
    function ParlayPersistence() {

        // Holds key/value pairs where the value is an Object that contains the directive name, attribute name and
        // a reference to the $scope object where the attribute resides.
        this.registrations = {};

        // Reference to items namespace ParlayStore.
        this.items_store = ParlayStore("items");

    }

    /**
     * Establishes an registration that will store the requested value when the workspace is saved.
     * @param {String} directive - Name of the directive where the requested attribute is to persisted.
     * @param {String} attribute - Name of the attribute that has been requested for persistence.
     * @param (AngularJS $scope} $scope - $scope Object where the requested attribute resides.
     * @returns {Function} - Deregistration function, will remove the registration established by the monitor request.
     */
    ParlayPersistence.prototype.monitor = function (directive, attribute, $scope) {

        // Register an Object with the directive name, attribute and $scope.
        this.registrations[directive + "{" + attribute + "}"] = {
            directive: directive,
            attribute: attribute,
            $scope: $scope
        };

        // On $scope $destroy remove the Object registered.
        $scope.$on("$destroy", function () {
            this.remove(directive, attribute);
        }.bind(this));

        /**
         * When the directive requests to monitor an attribute we will also attempt to restore any value that has been
         * store on the container Object from a restored workspace.
         */
        function restore() {
            // Object that may contain values that have been previously stored.
            var stored_values = find_scope('container', $scope).container.stored_values;

            // If stored values exist and the attribute requested for persistence is available we should attempt to
            // set the value on the given $scope object to the previously stored value.
            if (stored_values !== undefined && stored_values[attribute] !== undefined) {

                var split_key = attribute.split(".");

                // Search for the $scope Object where the attribute exists.
                var relevant_scope = find_parent(attribute, find_scope(attribute, $scope));

                // If a $scope Object exists with the given attribute we should set the value to the stored value.
                if (relevant_scope) {
                    relevant_scope[split_key[split_key.length - 1]] = stored_values[attribute];
                }
                // If a $scope value doesn't exist we will set the attribute on the given $scope Object.
                else {
                    $scope[attribute] = stored_values[attribute];
                }

                // Remove the stored value since restoration has been attempted.
                delete stored_values[attribute];

                // If all stored values have been removed then we can remove the stored values Object to tidy things up.
                if (Object.keys(stored_values).length === 0) {
                    delete find_scope('container', $scope).container.stored_values;
                }

            }
        }

        // Attempt to restore any stored values when the directive requests we monitor an attribute.
        restore();

		// Return a function that when called will remove the attribute registration.
        return function () {
            this.remove(directive, attribute);
        }.bind(this);
    };

    /**
     * Removes the attribute registration for the given directive and attribute.
     * @param {String} directive - Name of the directive where a registration has been made.
     * @param {String} attribute - Name of the attribute that was been requested for persistence.
     */
	ParlayPersistence.prototype.remove = function (directive, attribute) {
        delete this.registrations[directive + "{" + attribute + "}"];
	};

    /**
     * Collects the current values of all attributes that are being monitored.
     * @returns {Object} - Object that maps directive{attribute} = value
     */
    ParlayPersistence.prototype.collectAll = function () {
        var directives = [];

        Object.keys(this.registrations).forEach(function (key) {
            if (directives.indexOf(this.registrations[key].directive) === -1) {
                directives.push(this.registrations[key].directive);
            }
        }, this);

        return directives.reduce(function (accumulator, directive) {
            accumulator[directive] = this.collectDirective(directive);
            return accumulator;
        }.bind(this), {});
    };

    /**
     * Collects the monitored attributes of the given directive.
     * @param {String} directive - Name of the directive where a registration has been made.
     * @returns {Object} - Object that maps attribute = value
     */
    ParlayPersistence.prototype.collectDirective = function (directive) {
        return this.getRegistration(directive).reduce(function (accumulator, registration) {
            // Search for the $scope Object where the attribute exists.
            var relevant_scope = find_parent(registration.attribute, find_scope(registration.attribute, registration.$scope));

            var split_key = registration.attribute.split('.');

            // If a $scope Object exists with the given attribute we should record the value.
            if (relevant_scope) {
                accumulator[registration.attribute] = angular.copy(relevant_scope[split_key[split_key.length - 1]]);
            }

            return accumulator;
        }, {});
    };

    /**
     * Returns all attribute registrations for the given directive.
     * @param {String} directive - Name of the directive where a registration has been made.
     * @returns {Array} - Array of monitored attribute registrations.
     */
    ParlayPersistence.prototype.getRegistration = function (directive) {
        return Object.keys(this.registrations).filter(function (key) {
            // Return only registrations that begin with the given directive name.
            return key.indexOf(directive) === 0;
        }).map(function (key) {
            return {
                directive: this.registrations[key].directive.replace(' ', '_'),
                attribute: this.registrations[key].attribute,
                $scope: this.registrations[key].$scope
            };
        }, this);
    };

    /**
     * Collects the monitored attributes and store them with ParlayStore using the given name.
     * @param {String} name - Given workspace name.
     */
    ParlayPersistence.prototype.store = function (name) {
        this.items_store.set(name, {
            name: name,
            timestamp: new Date(),
            data: this.collectAll()
        });

    };

    return new ParlayPersistence();
}

angular.module('parlay.store.persistence', ['parlay.store'])
	.factory('ParlayPersistence', ['ParlayStore', ParlayPersistenceFactory]);