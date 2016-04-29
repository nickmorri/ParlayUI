(function () {
    "use strict";

    var module_name = "promenade.items.standarditem.graph";
    var module_dependencies = ["promenade.smoothiechart"];

    // Register this module as a StandardItem dependency.
    standard_item_dependencies.push(module_name);

    angular
        .module(module_name, module_dependencies)
        .controller("PromenadeStandardItemCardGraphTabController", PromenadeStandardItemCardGraphTabController)
        .controller("PromenadeStandardItemCardGraphTabConfigurationController", PromenadeStandardItemCardGraphTabConfigurationController)
        .directive('promenadeStandardItemCardGraph', PromenadeStandardItemCardGraph);

    /**
     * Controller constructor for the graph tab.
     * @constructor
     * @param {AngularJS $scope} $scope - A AngularJS $scope Object.
     * @param {Material Angular Service} $mdDialog - Dialog modal service.
     * @param {AngularJS $interval} $interval - A AngularJS service that is analogous to setInterval.
     * @param {Material Angular Service} $mdMedia - Media size detection service.
     * @param {Parlay Service} ParlayUtility - Service that provides utility functions.
     * @param {Parlay Service} ParlayItemPersistence - Service that provides automatic persistence of scope variables to localStorage.
     */
    PromenadeStandardItemCardGraphTabController.$inject = ["$scope", "$mdDialog", "$interval", "ParlayUtility", "ParlayItemPersistence"];
    function PromenadeStandardItemCardGraphTabController($scope, $mdDialog, $interval, ParlayUtility, ParlayItemPersistence) {

        this.enabled_streams = [];

        var container = ParlayUtility.relevantScope($scope, 'container').container;
        var directive_name = 'parlayItemCard.' + container.ref.name.replace(' ', '_') + '_' + container.uid;

        // Persist enabled streams across workspaces.
        ParlayItemPersistence.monitor(directive_name, "ctrl.enabled_streams", $scope);

        this.streamColors = [];

        this.updateStreamColors = function () {
            this.streamColors = this.getSmoothie() ? this.getSmoothie().seriesSet.map(function (series) {
                return {
                    name: series.options.streamName,
                    color: series.options.strokeStyle
                };
            }) : [];
        };

        this.hasStreamsAvailable = function () {
            return Object.keys(this.item.data_streams).length > 0;
        };

        /**
         * Launches graph configuration $mdDialog modal.
         * @param {MouseEvent} $event - Used to create source for $mdDialog opening animation.
         */
        this.openConfigurationDialog = function($event) {
            $mdDialog.show({
                controller: "PromenadeStandardItemCardGraphTabConfigurationController",
                controllerAs: "ctrl",
                locals: {
                    item: this.item,
                    enabled_streams: this.enabled_streams,
                    smoothie: this.getSmoothie()
                },
                bindToController: true,
                templateUrl: "../vendor_components/promenade/items/directives/promenade-standard-item-card-graph-configuration-dialog.html",
                targetEvent: $event,
                clickOutsideToClose: true
            }).finally(this.updateStreamColors);
        };

        $interval(this.updateStreamColors.bind(this), 1000);

    }

    /**
     * Returns a count of all currently enabled streams.
     * @returns {Number} - Count of currently enabled streams.
     */
    PromenadeStandardItemCardGraphTabController.prototype.streamCount = function() {
        return this.enabled_streams.length;
    };

    /**
     * Controller constructor for the graph configuration dialog.
     * @constructor
     * @param {AngularJS $scope} $scope - AngularJS $scope Object.
     * @param {Material Angular Service} $mdDialog - Dialog modal service.
     * @param {Material Angular Service} $mdMedia - Media size detection service.
     */
    PromenadeStandardItemCardGraphTabConfigurationController.$inject = ["$scope", "$mdDialog", "$mdMedia", "item", "enabled_streams", "smoothie"];
    function PromenadeStandardItemCardGraphTabConfigurationController($scope, $mdDialog, $mdMedia) {
        this.hide = $mdDialog.hide;

        // When minValue or maxValue are defined we should initialize their lock to true.
        this.minimum_locked = this.smoothie.options.minValue !== undefined;
        this.maximum_locked = this.smoothie.options.maxValue !== undefined;

        /**
         * Toggles the streams between enabled and disabled. Requests or cancels stream depending on state.
         */
        this.toggleGraphing = function(stream) {
            if (this.enabled_streams.indexOf(stream.name) == -1) {
                this.enabled_streams.push(stream.name);
                stream.listen(false);
            }
            else {
                // Remove the stream from the Array of enabled streams.
                this.enabled_streams.splice(this.enabled_streams.indexOf(stream.name), 1);
                // If stream value currently defined ask the user if they want to cancel the stream.
                if (stream.value !== undefined) {
                    // Ask the user if they'd like to cancel the stream as well.
                    $mdDialog.show($mdDialog.confirm()
                        .title("Cancel streaming " + stream.name + "?")
                        .content("End the current stream request.")
                        .ok("End")
                        .cancel("Dismiss")
                    ).then(function () {
                        stream.listen(true);
                    }.bind(this));
                }
                // Otherwise silently cancel the stream.
                else {
                    stream.listen(true);
                }
            }
        };

        // Attach reference to $mdMedia to scope so that media queries can be done.
        $scope.$mdMedia = $mdMedia;

    }

    /**
     * Toggles the state of the minimum lock. If we are removing lock we should remove the minValue from Smoothie options.
     */
    PromenadeStandardItemCardGraphTabConfigurationController.prototype.toggleMinimum = function () {

        this.minimum_locked = !this.minimum_locked;

        // Occurs when user enables checkbox.
        if (this.minimum_locked) {
            // We want to remove the y range function when the user explicitly sets value as these should not automatically
            // be scaled. Store a reference to it so it can be restored if the lock is removed.
            this.smoothie.options.yRangeFunctionRef = this.smoothie.options.yRangeFunction;
            delete this.smoothie.options.yRangeFunction;
            this.smoothie.options.minValue = this.smoothie.valueRange.min;
        }
        // Occurs when user disables checkbox.
        else {
            // Set the y range function when the user remove the lock.
            this.smoothie.options.yRangeFunction = this.smoothie.options.yRangeFunctionRef;
            delete this.smoothie.options.yRangeFunctionRef;
            delete this.smoothie.options.minValue;
        }
    };

    /**
     * Toggles the state of the maximum lock. If we are removing lock we should remove the maxValue from Smoothie options.
     */
    PromenadeStandardItemCardGraphTabConfigurationController.prototype.toggleMaximum = function () {

        this.maximum_locked = !this.maximum_locked;

        // Occurs when user enables checkbox.
        if (this.maximum_locked) {
            // We want to remove the y range function when the user explicitly sets value as these should not automatically
            // be scaled. Store a reference to it so it can be restored if the lock is removed.
            this.smoothie.options.yRangeFunctionRef = this.smoothie.options.yRangeFunction;
            delete this.smoothie.options.yRangeFunction;
            this.smoothie.options.maxValue = this.smoothie.valueRange.max;
        }
        // Occurs when user disables checkbox.
        else {
            // Set the y range function when the user remove the lock.
            this.smoothie.options.yRangeFunction = this.smoothie.options.yRangeFunctionRef;
            delete this.smoothie.options.yRangeFunctionRef;
            delete this.smoothie.options.maxValue;
        }
    };

    PromenadeStandardItemCardGraphTabConfigurationController.prototype.isStreamEnabled = function (stream) {
        return this.enabled_streams.indexOf(stream.name) >= 0;
    };

    /**
     * Constructor for the graph directive.
     * @returns {Object} - AngularJS directive object.
     */
    function PromenadeStandardItemCardGraph() {
        return {
            scope: {
                item: "="
            },
            templateUrl: '../vendor_components/promenade/items/directives/promenade-standard-item-card-graph.html',
            controller: "PromenadeStandardItemCardGraphTabController",
            controllerAs: "ctrl",
            bindToController: true
        };
    }

}());