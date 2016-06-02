(function () {
    "use strict";

    var module_dependencies = [];

    angular
        .module("promenade.items.datastream", module_dependencies)
        .factory("PromenadeStandardDatastream", PromenadeStandardDatastreamFactory);

    PromenadeStandardDatastreamFactory.$inject = ["$rootScope"];
    function PromenadeStandardDatastreamFactory ($rootScope) {

        /**
         * Class that wraps data stream information provided in a discovery.
         * @constructor module:PromenadeStandardItem.PromenadeStandardDatastream
         * @param {Object} data - Discovery information used to initialize the PromenadeStandardDatastream instance with.
         * @param {String} item_name - Name of the [PromenadeStandardItem]{@link module:PromenadeStandardItem.PromenadeStandardItem} this command belongs to.
         * @param {Object} protocol - Reference to the [PromenadeDirectMessage]{@link module:PromenadeDirectMessage.PromenadeDirectMessage} the [PromenadeStandardItem]{@link module:PromenadeStandardItem.PromenadeStandardItem} belongs to.
         */
        function PromenadeStandardDatastream (data, item_name, protocol) {

            var datastream = this;

            /**
             * Allow easier identification of properties, data streams, commands, etc.
             * @member module:PromenadeStandardItem.PromenadeStandardDatastream#type
             * @public
             * @type {String}
             */
            datastream.type = "datastream";

            /**
             * Name of the data stream.
             * @member module:PromenadeStandardItem.PromenadeStandardDatastream#name
             * @public
             * @type {String}
             */
            datastream.name = data.NAME;

            /**
             * Holds internal value in the constructor closure scope.
             * @member module:PromenadeStandardItem.PromenadeStandardDatastream#read_only
             * @private
             * @type {*}
             */
            var internal_value;

            /**
             * Holds callbacks that are invoked on every value change.
             * @member module:PromenadeStandardItem.PromenadeStandardDatastream#on_change_callbacks
             * @private
             * @type {Object}
             */
            var on_change_callbacks = {};

            /**
             * Define a custom setter to allow us to invoke the onChange callbacks.
             * Stores actual value in [internal_value]{@link PromenadeStandardDatastream#internal_value}
             * @member module:PromenadeStandardItem.PromenadeStandardDatastream#value
             * @public
             * @type {*}
             */
            Object.defineProperty(datastream, "value", {
                writeable: true,
                enumerable: true,
                get: function () {
                    return internal_value;
                },
                set: function (new_value) {
                    internal_value = new_value;
                    Object.keys(on_change_callbacks).forEach(function (key) {
                        on_change_callbacks[key](internal_value);
                    });
                }
            });

            /**
             * Name of the [PromenadeStandardItem]{@link module:PromenadeStandardItem.PromenadeStandardItem} this
             * data stream belongs to.
             * @member module:PromenadeStandardItem.PromenadeStandardDatastream#item_name
             * @public
             * @type {String}
             */
            datastream.item_name = item_name;

            /**
             * Reference to the [PromenadeDirectMessage]{@link module:PromenadeDirectMessage.PromenadeDirectMessage} the [PromenadeStandardItem]{@link module:PromenadeStandardItem.PromenadeStandardItem} belongs to.
             * @member module:PromenadeStandardItem.PromenadeStandardDatastream#protocol
             * @public
             * @type {Object}
             */
            datastream.protocol = protocol;

            // Attach methods to PromenadeStandardDatastream.
            datastream.listen = listen;
            datastream.onChange = onChange;

            /**
             * Requests a listener for the data stream. Saves a reference to deregistration function returned by
             * [PromenadeDirectMessage.onMessage]{@link module:PromenadeDirectMessage.PromenadeDirectMessage#onMessage}.
             * @member module:PromenadeStandardItem.PromenadeStandardDatastream#listener
             * @public
             * @type {Function}
             */
            datastream.listener = protocol.onMessage({
            TX_TYPE: "DIRECT",
                MSG_TYPE: "STREAM",
                TO: "UI",
                FROM: datastream.item_name,
                STREAM: datastream.name
            }, function(response) {
                $rootScope.$apply(function () {
                    datastream.value = response.VALUE;
                });
            });

            /**
             * Allows for callbacks to be registered, these will be invoked on change of value.
             * @member module:PromenadeStandardItem.PromenadeStandardDatastream#onChange
             * @public
             * @param {Function} callback - Function to be invoked whenever the value attribute changes.
             * @returns {Function} - onChange deregistration function.
             */
            function onChange (callback) {
                var UID = 0;
                var keys = Object.keys(on_change_callbacks).map(function (key) { return parseInt(key, 10); });
                while (keys.indexOf(UID) !== -1) {
                    UID++;
                }
                on_change_callbacks[UID] = callback;

                return function deregister() {
                    delete on_change_callbacks[UID];
                };
            }

            /**
             * Request that the stream values be broadcast.
             * @member module:PromenadeStandardItem.PromenadeStandardDatastream#listen
             * @public
             * @param {Boolean} [stop] - If true it will stop the data stream broadcast.
             * @returns {$q.deferred.Promise} - Resolved on receipt of broad cast message.
             */
            function listen (stop) {
                return protocol.sendMessage({
                    TX_TYPE: "DIRECT",
                    MSG_TYPE: "STREAM",
                    TO: datastream.item_name
                },
                {
                    STREAM: datastream.name,
                    STOP: !!stop
                },
                {
                    TX_TYPE: "DIRECT",
                    MSG_TYPE: "STREAM",
                    TO: "UI",
                    FROM: datastream.item_name
                });
            }

        }

        return PromenadeStandardDatastream;
    }

}());