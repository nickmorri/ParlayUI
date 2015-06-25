"use strict";

describe('parlay.socket', function() {
    
    beforeEach(module('parlay.socket'));
    
	describe('ParlaySocket', function () {
		var ParlaySocket, $websocketBackend;

		beforeEach(inject(function(_parlaySocket_, _$websocketBackend_) {
    		ParlaySocket = _parlaySocket_;
            $websocketBackend = _$websocketBackend_;
            
            $websocketBackend.mock();
            $websocketBackend.expectConnect('ws://localhost:8085');
		}));
		
		
		
	});
    
});