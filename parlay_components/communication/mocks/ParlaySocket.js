function ParlaySocket($q) {
    var Public = {
	    connected: false
    };
    
    Public.onOpen = function () {
	    
    };
    
    Public.onMessage = function () {
        return function () {};
    };
    
    Public.sendMessage = function (topics, contents, response_topics, response_callback) {
        if (contents === null) {
            response_callback({STATUS: -1});
        }
        else {
            contents.STATUS = 0;
            response_callback(contents);
        }
    };
    
    Public.open = function () {
		this.connected = true;
		return $q(function (resolve) {
			resolve();
		});
    };
    
    Public.close = function () {
        this.connected = false;
        return $q(function (resolve) {
			resolve();
		});
    };
    
    Public.isConnected = function () {
        return this.connected;
    };
    
    Public.onOpen = function () {};
                
    Public.onClose = function () {};
    
    Public.getAddress = function () {
        return 'ws://localhost:8080';
    };
    
    return Public;
}

angular.module('mock.parlay.socket', [])
	.factory('ParlaySocket', ['$q', ParlaySocket]);