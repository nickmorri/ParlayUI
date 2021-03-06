(function () {
    "use strict";

    var module_dependencies = [];

    angular
        .module('mock.parlay.socket', module_dependencies)
        .factory('ParlaySocket', MockParlaySocketFactory);

    MockParlaySocketFactory.$inject = ["$q"];
    function MockParlaySocketFactory($q) {

        var connected = false;
        var on_message_callbacks = {};
        var on_open_callbacks = [];
        var on_close_callbacks = [];

        var sample_responses = {
            '{"request":"open_protocol","type":"broker"}{"protocol_name":"TestProtocol","params":1}{"response":"open_protocol_response","type":"broker"}': {
                STATUS: "ok"
            },
            '{"request":"close_protocol","type":"broker"}{"protocol":"TestProtocol"}{"response":"close_protocol_response","type":"broker"}': {
                STATUS: "ok"
            },
            '{"request":"get_discovery","type":"broker"}{"force":true,"STATUS":0}{"response":"get_discovery_response","type":"broker"}': {
                STATUS: "ok"
            },
            '{"request":"get_open_protocols","type":"broker"}{}{"response":"get_open_protocols_response","type":"broker"}': {
                status: "ok"
            },
            '{"TO":100,"MSG_ID":201,"FROM":"UI"}{}{"FROM":100,"TO":"UI"}': {
                TOPICS: {
                    MSG_STATUS: "OK"
                }
            },
            '{"TO":100,"MSG_ID":201,"FROM":"UI"}{}{"FROM":200,"TO":"UI"}': {
                TOPICS: {
                    MSG_STATUS: "ERROR"
                }
            }
        };

        function MockParlaySocket() {}

        MockParlaySocket.prototype.onOpen = function (callback) {
            on_open_callbacks.push(callback);
        };

        MockParlaySocket.prototype.onClose = function (callback) {
            on_close_callbacks.push(callback);
        };

        MockParlaySocket.prototype.onMessage = function (topics, callback) {
            if (on_message_callbacks[JSON.stringify(topics)]) {
                on_message_callbacks[JSON.stringify(topics)].push(callback);
            }
            else {
                on_message_callbacks[JSON.stringify(topics)] = [callback];
            }
            return function () {};
        };

        MockParlaySocket.prototype.triggerOnMessage = function (topics, contents, response_contents) {
            if (on_message_callbacks[JSON.stringify(topics)] !== undefined) {
                on_message_callbacks[JSON.stringify(topics)].forEach(function (callback) {
                    callback(response_contents);
                });
            }
        };

        MockParlaySocket.prototype.open = function () {
            connected = true;
            on_open_callbacks.forEach(function (callback) {
                callback();
            });
            return $q(function (resolve) { resolve(); });
        };

        MockParlaySocket.prototype.close = function () {
            connected = false;
            on_close_callbacks.forEach(function (callback) {
                callback();
            });
            return $q(function (resolve) { resolve(); });
        };

        MockParlaySocket.prototype.isConnected = function () {
            return connected;
        };

        MockParlaySocket.prototype.getAddress = function () {
            return 'ws://localhost:8080';
        };

        MockParlaySocket.prototype.sendMessage = function (topics, contents, response_topics, response_callback) {
            if (response_callback == null) {
                return $q(function (resolve, reject) {
                    reject({STATUS: "ERROR"});
                });
            }
            else if (contents == null) {
                response_callback({STATUS: -1});
                return $q(function (resolve, reject) {
                    reject({STATUS: "ERROR"});
                });
            }
            else if (sample_responses[JSON.stringify(topics) + JSON.stringify(contents) + JSON.stringify(response_topics)] !== undefined) {
                response_callback(sample_responses[JSON.stringify(topics) + JSON.stringify(contents) + JSON.stringify(response_topics)]);
                return $q(function (resolve) {
                    resolve(response_callback(sample_responses[JSON.stringify(topics) + JSON.stringify(contents) + JSON.stringify(response_topics)]));
                });
            }
            else {
                contents.STATUS = 0;
                response_callback(contents);
                return $q(function (resolve) {
                    resolve(contents);
                });
            }
        };

        return new MockParlaySocket();

    }

}());
