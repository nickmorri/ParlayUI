var socket = angular.module('parlay.socket', ['ngWebSocket']);

socket.factory('ParlaySocket', ['$websocket', '$q', '$rootScope', '$log', function ($websocket, $q, $rootScope, $log) {
    
    var Public = {
        connected: false
    };
    
    var Private = {
        rootScope: $rootScope,
        public: Public,
        socket: $websocket('ws://localhost:' + 8085),
        onMessageActions: {}
    };
    
    Private.socket.onOpen(function (event) {
        Private.rootScope.$applyAsync(function () {
            Private.public.connected = true;
        });
        
    });
    
    Private.socket.onClose(function (event) {
        Private.rootScope.$applyAsync(function () {
            Private.public.connected = false;
        });
    });    
    
    Private.close = function () {
        $q(function (resolve, reject) {
            Private.socket.close();
            resolve();
        });
    };
    
    Private.send = function (message) {
        return Private.socket.send(message);
    };
    
    Private.socket.onMessage(function(messageEvent) {
        var message = JSON.parse(messageEvent.data);
        try {
            Private.onMessageActions[message.topic] = Private.onMessageActions[message.topic].filter(function (action) {
                action.callback(this);
                return action.permenant;
            }, message.contents);
        } catch (error) {
            $log.error(error.message);
        }
        
    });
    
    Public.onOpen = function (topic, contents) {
        
    };
    
    Public.onMessage = function (topics, callback) {
        if (typeof topics === 'string') {
            if (Private.onMessageActions.hasOwnProperty(topics)) {
                Private.onMessageActions[topics].push({callback: callback, permenant: true});    
            }
            else {
                Private.onMessageActions[topics] = [{callback: callback, permenant: true}];
            }
        }
        else if (Array.isArray(topics)) {
            topics.forEach(function (topic) {
                if (this.hasOwnProperty(topic)) {
                    this[topic].push({callback: callback, permenant: true});
                }
                else {
                    this[topic] = [{callback: callback, permenant: true}];    
                }                
            }, Private.onMessageActions);    
        }
        else if (typeof topics === 'object') {
            for (var topic in topics) {
                if (Private.onMessageActions.hasOwnProperty(topic)) {
                    Private.onMessageActions[topic].push({callback: topics[topic], permenant: true});
                }
                else {
                    Private.onMessageActions[topic] = [{callback: topics[topic], permenant: true}];
                }
            }
        }
        else {
            throw new TypeError('tets');
        }
        
    };
    
    Public.sendMessage = function (topic, contents, callback) {
        if (callback !== undefined) {
            if (Private.onMessageActions.hasOwnProperty(topic)) {
                Private.onMessageActions[topic].push({callback: callback, permenant: false});
            }
            else {
                Private.onMessageActions[topic] = [{callback: callback, permenant: false}];
            }
        }
        return Private.send({topic: topic, contents: contents});
    };
    
    Public.close = function () {
        return Private.close();
    };
    
    return Public;
}]);