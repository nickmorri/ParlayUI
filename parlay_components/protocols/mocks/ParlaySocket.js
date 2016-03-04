function MockParlaySocketFactory($q) {
    "use strict";

    var connected = false;
    var on_open_callbacks = [];
    var on_close_callbacks = [];

    function MockParlaySocket() {}

    MockParlaySocket.prototype.onOpen = function (callback) {
        on_open_callbacks.push(callback);
    };

    MockParlaySocket.prototype.onClose = function (callback) {
        on_close_callbacks.push(callback);
    };

    MockParlaySocket.prototype.onMessage = function () {
        return function () {};
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
        if (response_callback == null) {}
        else if (contents == null) {
            response_callback({STATUS: -1});
        }
        else {
            contents.STATUS = 0;
            response_callback(contents);
        }
    };

    return new MockParlaySocket();

}

angular.module('mock.parlay.socket', [])
    .factory('ParlaySocket', ['$q', MockParlaySocketFactory]);