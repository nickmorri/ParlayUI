"use strict";

describe('parlay.socket', function() {
    
    beforeEach(module('parlay.socket'));
    
	describe('ParlaySocket', function () {
		var ParlaySocket;

		beforeEach(inject(function(_ParlaySocket_) {
    		ParlaySocket = _ParlaySocket_({
        		url: 'ws://' + location.hostname + ':8085',
        		mock:{
            		openTimeout: 1,
                    closeTimeout: 1,
                    messageInterval: 1
                }
            });
		}));
		
		afterEach(function () {
    		ParlaySocket.close();
		});
		
		describe('initialization', function () {

			it('is mock', function () {
    			expect(ParlaySocket.isMock()).toBeTruthy();
            });
            
            it('is open', function (done) {
                ParlaySocket.onOpen(function () {
                    expect(ParlaySocket.isConnected()).toBeTruthy();
                    done();
                });                
            });
    
        });
        
        describe('destructs', function () {
            
            it('is closed', function (done) {
                ParlaySocket.onOpen(function () {
                    ParlaySocket.onClose(function () {
                        expect(ParlaySocket.isConnected()).toBeFalsy();
                        done();
                    });
                    ParlaySocket.close();
                });
                
            });
            
        });
        
        describe('sends', function () {
            
            it('a message', function (done) {
                ParlaySocket.sendMessage({"type":"motor"}, {"data":"test"}, function (response) {
                    expect(response.data).toBe("test");
                    done();
                });            
            });
            
            it('multiple messages', function (done) {
                var count = 10;
                function checkDone (done) {
                    count++;
                    if (count >= 4) done();
                };
                
                ParlaySocket.sendMessage({"type":"motor"}, {"data":"test"}, function (response) {
                    expect(response.data).toBe("test");
                    checkDone(done);
                });
                ParlaySocket.sendMessage({"type":"motor"}, {"data":"test"}, function (response) {
                    expect(response.data).toBe("test");
                    checkDone(done);
                });
                ParlaySocket.sendMessage({"type":"motor"}, {"data":"test"}, function (response) {
                    expect(response.data).toBe("test");
                    checkDone(done);
                });
                ParlaySocket.sendMessage({"type":"motor"}, {"data":"test"}, function (response) {
                    expect(response.data).toBe("test");
                    checkDone(done);
                });
            });
            
        });
        
        describe('listens for', function () {
            
            it('a message', function (done) {
                ParlaySocket.onMessage({"type":"motor"}, done);
                ParlaySocket.sendMessage({"type":"motor"}, {"data":"test"});
            });
            
            it('multiple messages', function (done) {
                var count = 0;
                
                ParlaySocket.onMessage({"type":"motor"}, function () {
                    count++;
                    if (count === 4) done();
                });

                ParlaySocket.sendMessage({"type":"motor"}, {"data":"test"});
                ParlaySocket.sendMessage({"type":"motor"}, {"data":"test"});
                ParlaySocket.sendMessage({"type":"motor"}, {"data":"test"});
                ParlaySocket.sendMessage({"type":"motor"}, {"data":"test"});
            });
            
        });
        
        describe('queues', function () {
            
            it('a message', function (done) {
                ParlaySocket.sendMessage({"type":"motor"}, {"data":"test"});
                ParlaySocket.onMessage({"type":"motor"}, function (response) {
                    expect(response.data).toBe("test");
                    done();
                });
            });
            
            it('multiple messages', function (done) {
                var count = 0;
                for (var i = 0; i < 10; i++) ParlaySocket.sendMessage({"type":"motor"}, {"data":"test"});
                ParlaySocket.onMessage({"type":"motor"}, function (response) {
                    count++;
                    if (count === 10) done();
                }); 
            });
            
        });
        
        describe('deregisters', function () {
            
            it('one listener', function (done) {
                
                var update = false;
                
                var registration = ParlaySocket.onMessage({"type":"motor"}, function () {
                    update = true;
                });
                
                ParlaySocket.sendMessage({"type":"motor"});
                
                setTimeout(function () {
                    expect(update).toBeFalsy();
                    done();
                }, 100);
                
                registration();
                
            });
            
            it('multiple listeners', function (done) {
                
                var registrations = [];
                var update_count = 0;
                
                registrations.push(ParlaySocket.onMessage({"type":"motor"}, function () {
                    update_count++;
                }));
                
                registrations.push(ParlaySocket.onMessage({"type":"motor"}, function () {
                    update_count++;
                }));
                
                ParlaySocket.sendMessage({"type":"motor"});
                
                registrations.pop()();
                
                setTimeout(function () {
                    expect(update_count).toBe(1);
                    done();
                }, 100);
                
            });
            
            it('all listeners', function (done) {
                var update_count = 0;
                
                var registrations = [];
                
                for (var i = 0; i < 10; i++) {
                    registrations.push(ParlaySocket.onMessage({"type":"motor"}, function () {
                        update_count++;
                    }));
                }
                
                while (registrations.length) registrations.pop()();
                                
                ParlaySocket.sendMessage({"type":"motor"});
                
                setTimeout(function () {
                    expect(update_count).toBe(0);
                    done();
                }, 100);
                
            });
            
        });
        
        describe('encodes', function () {
            
            // NOTE: Encoding is done by sorting topics by comparison of keys in Unicode code point order.
            
            it('strings', function () {
                expect(ParlaySocket._private.encodeTopics({"type": "motor"})).toBe('{"type":"motor"}');
            });
            
            it('numbers', function () {
                expect(ParlaySocket._private.encodeTopics({"to_device": 22})).toBe('{"to_device":22}');   
            });
            
            it('arrays', function () {
                expect(ParlaySocket._private.encodeTopics({"params": []})).toBe('{"params":[]}');
                expect(ParlaySocket._private.encodeTopics({"params": [5, 10]})).toBe('{"params":[10,5]}');
                expect(ParlaySocket._private.encodeTopics({"params": [{"type":1}, 10]})).toBe('{"params":[10,{"type":1}]}');
            });
            
            it('multiple topics', function () {
                expect(ParlaySocket._private.encodeTopics({"type": "motor", "weight":"bold"})).toBe('{"type":"motor","weight":"bold"}');
            });
            
            it('mixed types', function () {
                expect(ParlaySocket._private.encodeTopics({"to_device": 22})).toBe('{"to_device":22}');
            });
            
            it('nested', function () {
                expect(ParlaySocket._private.encodeTopics({"params": {"port": 22, "socket":"localhost"}, "data": []})).toBe('{"data":[],"params":{"port":22,"socket":"localhost"}}');
            });
            
            it('orders topics consistently', function () {
                expect(ParlaySocket._private.encodeTopics({"aaa":0, "bbb":1})).toBe('{"aaa":0,"bbb":1}');
                expect(ParlaySocket._private.encodeTopics({"bbb":1, "aaa":0})).toBe('{"aaa":0,"bbb":1}');
            });
            
        });
    		
    });
    
});