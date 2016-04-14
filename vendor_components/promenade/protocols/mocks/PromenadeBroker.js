(function () {
    "use strict";

    var sample_items = function () {
        var items = [];

        for (var i = 0; i < 50; i++) {
            items.push({
                ID: 100 + i,
                INTERFACES: [],
                NAME: 'TEST' + i,
                TEMPLATE: 'STD_ITEM'
            });
        }

        return items;
    }();

    var sample_discovery = {
        CHILDREN: sample_items,
        NAME: 'TestProtocol',
        TEMPLATE: 'Protocol'
    };

    angular.module('mock.promenade.broker', []).factory('PromenadeBroker', ['$q', function($q) {
        var PromenadeBroker = {
            connected: false,
            onDiscoveryCallbacks: [],
            onOpenCallbacks: [],
            onCloseCallbacks: [],
            discovered: false
        };

        PromenadeBroker.requestAvailableProtocols = function () {
            return $q(function (resolve) {
                resolve([]);
            });
        };

        PromenadeBroker.requestOpenProtocols = function () {
            return $q(function (resolve) {
                resolve([]);
            });
        };

        PromenadeBroker.sendSubscribe = function () {
            return $q(function (resolve) {
                resolve(true);
            });
        };

        PromenadeBroker.sendUnsubscribe = function () {
            return $q(function (resolve) {
                resolve(true);
            });
        };

        PromenadeBroker.requestDiscovery = function () {
            PromenadeBroker.onDiscoveryCallbacks.forEach(function (callback) {
                callback({discovery: [sample_discovery]});
            });
            this.discovered = true;
            return $q(function (resolve) {
                resolve({discovery: sample_discovery});
            });
        };

        PromenadeBroker.onDiscovery = function (callback) {
            PromenadeBroker.onDiscoveryCallbacks.push(callback);
        };

        PromenadeBroker.onOpen = function (callback) {
            PromenadeBroker.onOpenCallbacks.push(callback);
        };

        PromenadeBroker.onClose = function (callback) {
            PromenadeBroker.onCloseCallbacks.push(callback);
        };

        PromenadeBroker.onMessage = function (response_topics, response_callback) {
            if (response_topics.response === 'get_protocols_response') response_callback({
                TestProtocol: {
                    params: ['port', 'timing'],
                    defaults: {
                        port: 10,
                        timing: 50
                    }
                }
            });
            else if (response_topics.response === 'get_open_protocols_response') response_callback({protocols: [
                {
                    name: 'TestProtocol',
                    protocol_type: 'PromenadeDirectMessageProtocol'
                }
            ]});
            else response_callback(response_topics);
        };

        PromenadeBroker.triggerOnClose = function () {
            PromenadeBroker.onCloseCallbacks.forEach(function (callback) {
                callback();
            });
        };

        PromenadeBroker.triggerOnOpen = function () {
            PromenadeBroker.onOpenCallbacks.forEach(function (callback) {
                callback();
            });
        };

        PromenadeBroker.openProtocol = function () {
            return $q(function (resolve) {
                resolve(true);
            });
        };

        PromenadeBroker.closeProtocol = function (protocol) {
            return $q(function (resolve) {
                if (protocol === 'TestProtocol') resolve({STATUS: 'ok'});
                else resolve({STATUS: 'error'});
            });
        };

        PromenadeBroker.getLastDiscovery = function () {
            return this.discovered ? [] : undefined;
        };

        return PromenadeBroker;
    }]);

}());