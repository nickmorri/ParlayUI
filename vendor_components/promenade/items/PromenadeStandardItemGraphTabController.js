(function () {
    "use strict";

    var module_name = "promenade.items.standarditem.graph";
    var module_dependencies = ["promenade.smoothiechart"];

    // Register module as [PromenadeStandardItem]{@link module:PromenadeStandardItem.PromenadeStandardItem} dependency.
    standard_item_dependencies.push(module_name);

    angular
        .module(module_name, module_dependencies)
        .controller("PromenadeStandardItemCardGraphTabController", PromenadeStandardItemCardGraphTabController)
        .controller("PromenadeStandardItemCardGraphTabConfigurationController", PromenadeStandardItemCardGraphTabConfigurationController)
        .directive('promenadeStandardItemCardGraph', PromenadeStandardItemCardGraph);

    PromenadeStandardItemCardGraphTabController.$inject = ["$scope", "$mdDialog", "ParlayUtility", "ParlayItemPersistence"];
    /**
     * Controller constructor for the graph tab.
     * @constructor module:PromenadeStandardItem.PromenadeStandardItemCardGraphTabController
     * @param {Object} $scope - AngularJS [$scope]{@link https://docs.angularjs.org/guide/scope} Object.
     * @param {Object} $mdDialog - Angular Material [$mdDialog]{@link https://material.angularjs.org/latest/api/service/$mdDialog} service.
     * @param {Object} ParlayUtility - [ParlayUtility]{@link module:ParlayUtility.ParlayUtility} service.
     * @param {Object} ParlayItemPersistence - [ParlayItemPersistence]{@link module:ParlayItem.ParlayItemPersistence}
     * service.
     */
    function PromenadeStandardItemCardGraphTabController($scope, $mdDialog, ParlayUtility, ParlayItemPersistence) {

        var ctrl = this;

        /**
         * Holds names of all currently enabled streams.
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardGraphTabController#enabled_streams
         * @public
         * @type {Array}
         */
        ctrl.enabled_streams = [];

        /**
         * Holds Objects that relate stream name and stream color.
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardGraphTabController#streamColors
         * @public
         * @type {Array}
         */
        ctrl.streamColors = [];

        // Attach methods to controller.
        ctrl.hasStreamsAvailable = hasStreamsAvailable;
        ctrl.openConfigurationDialog = openConfigurationDialog;
        ctrl.streamCount = streamCount;
        ctrl.convenienceOpen = convenienceOpen;
        ctrl.downloadCSV = downloadCSV;

        // Persist enabled streams across sessions.
        ctrl.$postLink = function() {
            var container = ParlayUtility.relevantScope($scope, 'container').container;
            var directive_name = 'parlayItemCard.' + container.ref.id.toString().replace(' ', '_') + '_' + container.uid;

            ParlayItemPersistence.monitor(directive_name, "ctrl.enabled_streams", $scope, function (meta_streams) {
                var item = ctrl.item;
                var enabled_streams = [];
                for (var i = 0; i < meta_streams.length; i++) {
                    var keys = Object.keys(item.data_streams);
                    for (var j = 0; j < keys.length; j++) {
                        if (item.data_streams[keys[j]].item_id === meta_streams[i].item_id &&
                            item.data_streams[keys[j]].id === meta_streams[i].id)
                            enabled_streams.push(item.data_streams[keys[j]]);
                    }
                }
                return enabled_streams;
            });
        };

        // wait until the getSmoothie function is linked, then set the labels of the graph
        var smoothieInitializer = $scope.$watch("ctrl.getSmoothie", function(newVal) {
            if (!!newVal) {
                setStreamColors();
                // unwatch the getSmoothie function
                smoothieInitializer();
            }
        });

        /**
         * True if streams are available, false otherwise.
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardGraphTabController#hasStreamsAvailable
         * @public
         * @returns {Boolean}
         */
        function hasStreamsAvailable () {
            return Object.keys(ctrl.item.data_streams).length > 0;

        }

        /**
         * open the configuration dialog if no streams have been selected
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardGraphTabController#convenienceOpen
         * @private
         */
        function convenienceOpen() {
            if (ctrl.hasStreamsAvailable() && ctrl.enabled_streams.length === 0)
                openConfigurationDialog();

        }


        /**
         * set the labels on the graph tab for active streams
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardGraphTabController#setStreamColors
         * @private
         */
        function setStreamColors() {
            ctrl.streamColors = ctrl.getSmoothie() ? ctrl.getSmoothie().seriesSet.map(function (series) {
                    return {
                        name: series.options.streamName,
                        color: series.options.strokeStyle
                    };
                }) : [];
        }


        /**
         * Launches graph configuration $mdDialog modal.
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardGraphTabController#openConfigurationDialog
         * @public
         * @param {MouseEvent} $event - Used to create source for $mdDialog opening animation.
         */
        function openConfigurationDialog ($event) {
            $mdDialog.show({
                controller: "PromenadeStandardItemCardGraphTabConfigurationController",
                controllerAs: "ctrl",
                locals: {
                    item: ctrl.item,
                    enabled_streams: ctrl.enabled_streams,
                    smoothie: ctrl.getSmoothie()
                },
                bindToController: true,
                templateUrl: "../vendor_components/promenade/items/directives/promenade-standard-item-card-graph-configuration-dialog.html",
                targetEvent: $event,
                clickOutsideToClose: true
            }).finally(function () {
                setStreamColors();
            });
        }

        /**
         * Returns a count of all currently enabled streams.
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardGraphTabController#streamCount
         * @public
         * @returns {Number} - Count of currently enabled streams.
         */
        function streamCount () {
            return ctrl.enabled_streams.length;
        }

        function downloadCSV() {
            ctrl.item.downloadCSV();
        }

    }

    PromenadeStandardItemCardGraphTabConfigurationController.$inject = ["$scope", "$mdDialog", "$mdMedia"];
    /**
     * Controller constructor for the graph configuration dialog.
     * @constructor module:PromenadeStandardItem.PromenadeStandardItemCardGraphTabConfigurationController
     * @param {Object} $scope - AngularJS [$scope]{@link https://docs.angularjs.org/guide/scope} Object.
     * @param {Object} $mdDialog - Angular Material [$mdDialog]{@link https://material.angularjs.org/latest/api/service/$mdDialog} service.
     * @param {Object} $mdMedia - Angular Material [$mdMedia]{@link https://material.angularjs.org/latest/api/service/$mdMedia} service.
     */
    function PromenadeStandardItemCardGraphTabConfigurationController ($scope, $mdDialog, $mdMedia) {

        var ctrl = this;

        /**
         * Flag indicating y-axis minimum lock status. When minValue is defined we should initialize to true.
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardGraphTabConfigurationController#minimum_locked
         * @public
         */
        ctrl.minimum_locked = ctrl.smoothie.options.minValue !== undefined;

        /**
         * Flag indicating y-axis maximum lock status. When maxValue is defined we should initialize to true.
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardGraphTabConfigurationController#minimum_locked
         * @public
         */
        ctrl.maximum_locked = ctrl.smoothie.options.maxValue !== undefined;

        // Attach reference to $mdMedia to scope so that media queries can be done.
        $scope.$mdMedia = $mdMedia;

        // Attach $mdDialog hide method to controller.
        ctrl.hide = $mdDialog.hide;

        // Attach methods to controller;
        ctrl.toggleGraphing = toggleGraphing;
        ctrl.toggleMinimum = toggleMinimum;
        ctrl.toggleMaximum = toggleMaximum;
        ctrl.isStreamEnabled = isStreamEnabled;

        /**
         * Toggles the streams between enabled and disabled. Requests or cancels stream depending on state.
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardGraphTabConfigurationController#toggleGraphing
         * @public
         * @param {Object} stream - Reference to a [PromenadeStandardDatastream]{@link module:PromenadeStandardItem.PromenadeStandardDatastream}.
         */
        function toggleGraphing (stream) {
            if (ctrl.enabled_streams.indexOf(stream) == -1) {
                ctrl.enabled_streams.push(stream);
                stream.listen(false, stream.rate);
            }
            else {
                // Remove the stream from the Array of enabled streams.
                ctrl.enabled_streams.splice(ctrl.enabled_streams.indexOf(stream), 1);
                stream.listen(true);
            }
        }

        /**
         * Toggles the state of the minimum lock. If we are removing lock we should remove the minValue from Smoothie options.
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardGraphTabConfigurationController#toggleMinimum
         * @public
         */
        function toggleMinimum () {

            ctrl.minimum_locked = !ctrl.minimum_locked;

            // Occurs when user enables checkbox.
            if (ctrl.minimum_locked) {
                // We want to remove the y range function when the user explicitly sets value as these should not automatically
                // be scaled. Store a reference to it so it can be restored if the lock is removed.
                ctrl.smoothie.options.yRangeFunctionRef = ctrl.smoothie.options.yRangeFunction;
                delete ctrl.smoothie.options.yRangeFunction;
                ctrl.smoothie.options.minValue = ctrl.smoothie.valueRange.min;
            }
            // Occurs when user disables checkbox.
            else {
                // Set the y range function when the user remove the lock.
                ctrl.smoothie.options.yRangeFunction = ctrl.smoothie.options.yRangeFunctionRef;
                delete ctrl.smoothie.options.yRangeFunctionRef;
                delete ctrl.smoothie.options.minValue;
            }
        }

        /**
         * Toggles the state of the maximum lock. If we are removing lock we should remove the maxValue from Smoothie options.
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardGraphTabConfigurationController#toggleMaximum
         * @public
         */
        function toggleMaximum () {

            ctrl.maximum_locked = !ctrl.maximum_locked;

            // Occurs when user enables checkbox.
            if (ctrl.maximum_locked) {
                // We want to remove the y range function when the user explicitly sets value as these should not automatically
                // be scaled. Store a reference to it so it can be restored if the lock is removed.
                ctrl.smoothie.options.yRangeFunctionRef = ctrl.smoothie.options.yRangeFunction;
                delete ctrl.smoothie.options.yRangeFunction;
                ctrl.smoothie.options.maxValue = ctrl.smoothie.valueRange.max;
            }
            // Occurs when user disables checkbox.
            else {
                // Set the y range function when the user remove the lock.
                ctrl.smoothie.options.yRangeFunction = ctrl.smoothie.options.yRangeFunctionRef;
                delete ctrl.smoothie.options.yRangeFunctionRef;
                delete ctrl.smoothie.options.maxValue;
            }
        }

        /**
         * True if the given stream is enabled, false otherwise.
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardGraphTabConfigurationController#toggleMaximum
         * @public
         * @param {Object} stream - Reference to a [PromenadeStandardDatastream]{@link module:PromenadeStandardItem.PromenadeStandardDatastream}.
         * @returns {Boolean}
         */
        function isStreamEnabled (stream) {
            return ctrl.enabled_streams.indexOf(stream) >= 0;
        }
    }

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