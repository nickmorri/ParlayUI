(function () {
    "use strict";

    var module_dependencies = ["parlay.protocols.protocol", "promenade.items.standarditem"];

    angular
        .module("promenade.protocols.directmessage", module_dependencies)
        .factory("PromenadeDirectMessageProtocol", PromenadeDirectMessageProtocolFactory);

    PromenadeDirectMessageProtocolFactory.$inject = ["ParlayProtocol", "PromenadeStandardItem", "$q"];
    function PromenadeDirectMessageProtocolFactory (ParlayProtocol, PromenadeStandardItem, $q) {

        /**
         * PromenadeDirectMessageProtocol constructor.
         * Prototypically inherits from ParlayProtocol.
         * @constructor
         */
        function PromenadeDirectMessageProtocol(configuration) {
            // Call the constructor of the prototype we inherit from.
            ParlayProtocol.call(this, configuration);

            // Set our own item_factory.
            this.item_factory = PromenadeStandardItem;

            // Defining custom attributes.
            this.current_message_id = 200;

        }

        // Create a Object that inherits from the prototype of ParlayProtocol.
        PromenadeDirectMessageProtocol.prototype = Object.create(ParlayProtocol.prototype);

        /**
         * Consumes a message ID by incrementing then returning this new ID.
         * @returns {Number} - current message ID
         */
        PromenadeDirectMessageProtocol.prototype.consumeMessageId = function () {
            return ++this.current_message_id;
        };

        /**
         * Returns the current message ID.
         * @returns {Number} - current message ID.
         */
        PromenadeDirectMessageProtocol.prototype.getMessageId = function () {
            return this.current_message_id;
        };

        /**
         * Constructs message topics from the partially built given message.
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
         * Examines response and returns True if message status ok.
         * @param {Object} response - Map of key/value pairs.
         * @returns {Boolean} - True if MSG_STATUS is not ERROR or WARNING
         */
        PromenadeDirectMessageProtocol.prototype.isResponseOk = function (response) {
            return ["ERROR", "WARNING"].indexOf(response.TOPICS.MSG_STATUS) === -1;
        };

        /**
         * Sends message with topics specific to PromenadeDirectMessage.
         * @param {Object} topics - Map of key/value pairs.
         * @param {Object} contents - Map of key/value pairs.
         * @param {Object} response_topics - Map of key/value pairs.
         * @param {Boolean} response_requires_msg_id - Response should have same MSG_ID as given topics.
         * @returns {$q.defer.Promise} - Resolved upon message receipt.
         */
        PromenadeDirectMessageProtocol.prototype.sendMessage = function (topics, contents, response_topics, response_requires_msg_id) {
            var extended_topics = this.buildMessageTopics(topics);
            var extended_response_topics = this.buildResponseTopics(extended_topics, response_topics, response_requires_msg_id);

            return ParlayProtocol.prototype.sendMessage(extended_topics, contents, extended_response_topics, true).then(function (response) {
                return this.isResponseOk(response) ? response : $q.reject(response);
            }.bind(this));
        };

        return PromenadeDirectMessageProtocol;
    }

}());