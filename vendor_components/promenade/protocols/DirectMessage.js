(function () {
    "use strict";

    /**
     * @module PromenadeDirectMessage
     */

    var module_dependencies = ["parlay.protocols.protocol", "promenade.items.standarditem"];

    angular
        .module("promenade.protocols.directmessage", module_dependencies)
        .factory("PromenadeDirectMessageProtocol", PromenadeDirectMessageProtocolFactory);

    PromenadeDirectMessageProtocolFactory.$inject = ["ParlayProtocol", "PromenadeStandardItem", "$q"];
    function PromenadeDirectMessageProtocolFactory (ParlayProtocol, PromenadeStandardItem, $q) {

        // Reference Message Topic Information Google Doc for more information.
        // https://docs.google.com/document/d/1MlR6e48Su19D7jF-1BxCPGOSNipOoQ7Y9i8o_ukMzXQ
        var msg_status_success = ["OK"];
        var msg_status_incomplete = ["INFO", "WARNING", "ACK"];
        var msg_status_error = ["ERROR"];

        /**
         * PromenadeDirectMessageProtocol constructor.
         * Prototypically inherits from [ParlayProtocol]{@link module:ParlayProtocol.ParlayProtocol}.
         * @extends module:ParlayProtocol.ParlayProtocol
         * @constructor module:PromenadeDirectMessage.PromenadeDirectMessage
         */
        function PromenadeDirectMessageProtocol(configuration) {
            // Call the constructor of the prototype we inherit from.
            ParlayProtocol.call(this, configuration);

            /**
             * Reference to the factory used to produce models for items connected to the protocol.
             * Overrides ParlayProtocol's item_factory with PromenadeStandardItem factory.
             * @member module:PromenadeDirectMessage.PromenadeDirectMessage#item_factory
             * @public
             * @type {Object}
             */
            this.item_factory = PromenadeStandardItem;


            /**
             * Incrementing message ID.
             * @member module:PromenadeDirectMessage.PromenadeDirectMessage#current_message_id
             * @public
             * @type {Number}
             */
            this.current_message_id = 200;

        }

        // Create a Object that inherits from the prototype of ParlayProtocol.
        PromenadeDirectMessageProtocol.prototype = Object.create(ParlayProtocol.prototype);

        /**
         * Consumes a message ID by incrementing then returning this new ID.
         * @member module:PromenadeDirectMessage.PromenadeDirectMessage#consumeMessageId
         * @public
         * @returns {Number} - current message ID
         */
        PromenadeDirectMessageProtocol.prototype.consumeMessageId = function () {
            return ++this.current_message_id;
        };

        /**
         * Returns the current message ID.
         * @member module:PromenadeDirectMessage.PromenadeDirectMessage#getMessageId
         * @public
         * @returns {Number} - current message ID.
         */
        PromenadeDirectMessageProtocol.prototype.getMessageId = function () {
            return this.current_message_id;
        };

        /**
         * Constructs message topics from the partially built given message.
         * @member module:PromenadeDirectMessage.PromenadeDirectMessage#buildMessageTopics
         * @public
         * @param {Object} topics - partially constructed message.
         * @returns {Object} - partially constructed message with topics.
         */
        PromenadeDirectMessageProtocol.prototype.buildMessageTopics = function (topics) {
            var new_topics = angular.copy(topics);
            new_topics.MSG_ID = this.consumeMessageId();
            new_topics.FROM = this.id;
            return new_topics;
        };

        /**
         * Constructs response topics from the partially built given message.
         * @member module:PromenadeDirectMessage.PromenadeDirectMessage#buildResponseTopics
         * @public
         * @param {Object} topics - topics portion of message, to and from are swapped.
         * @param {Object} additional_topics - additional topics that are expected on response.
         * @param {Boolean} response_requires_msg_id - include the topics MSG_ID
         * @returns {Object} - partially constructed message with response topics.
         */
        PromenadeDirectMessageProtocol.prototype.buildResponseTopics = function (topics, additional_topics, response_requires_msg_id) {

            var base = {
                FROM: topics.TO,
                TO: topics.FROM
            };

            if (response_requires_msg_id) {
                base.MSG_ID = topics.MSG_ID;
            }

            if (additional_topics) {
                Object.keys(additional_topics).forEach(function(key) {
                    if (additional_topics[key] === undefined) {
                        delete base[key];
                    }
                    else {
                        base[key] = additional_topics[key];
                    }
                });
            }

            return base;

        };

        /**
         * Sends message with topics specific to PromenadeDirectMessage.
         * @member module:PromenadeDirectMessage.PromenadeDirectMessage#sendMessage
         * @public
         * @param {Object} topics - Map of key/value pairs.
         * @param {Object} contents - Map of key/value pairs.
         * @param {Object} response_topics - Map of key/value pairs.
         * @param {Boolean} response_requires_msg_id - Response should have same MSG_ID as given topics.
         * @returns {$q.defer.Promise} - Resolved upon message receipt.
         */
        PromenadeDirectMessageProtocol.prototype.sendMessage = function (topics, contents, response_topics, response_requires_msg_id) {
            var extended_topics = this.buildMessageTopics(topics);
            var extended_response_topics = this.buildResponseTopics(extended_topics, response_topics, response_requires_msg_id);
            var ok_response_topics = angular.merge({MSG_STATUS: "OK"}, extended_response_topics);
            var error_response_topics = angular.merge({MSG_STATUS: "ERROR"}, extended_response_topics);

            // Resolved on a response of MSG_TYPE "OK" or "ERROR", notified otherwise.
            var deferred = $q.defer();

            // Register persistent listener to monitor responses that are incomplete. ["ACK", "WARNING", "INFO"]
            var incomplete_listener_registration = this.onMessage(extended_response_topics, function (response) {
                deferred.notify(response);
            }, true);

            // Register a listener for a response of MSG_STATUS "OK".
            var ok_listener_registration = this.onMessage(ok_response_topics, function (response) {
                // On receipt of a message with MSG_TYPE "OK" we should clear the other listener registrations and
                // resolve the deferred.
                incomplete_listener_registration();
                error_listener_registration();
                deferred.resolve(response);
            }, true);

            // Register a listener for a response of MSG_STATUS "ERROR".
            var error_listener_registration = this.onMessage(error_response_topics, function (response) {
                // On receipt of a message with MSG_TYPE "ERROR" we should clear the other listener registrations and
                // reject the deferred.
                incomplete_listener_registration();
                ok_listener_registration();
                deferred.reject(response);
            }, true);

            ParlayProtocol.prototype.sendMessage(extended_topics, contents, extended_response_topics);

            return deferred.promise;
        };

        return PromenadeDirectMessageProtocol;
    }

}());