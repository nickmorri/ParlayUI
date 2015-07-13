(function () {
    "use strict";
    
    describe('parlay.socket', function() {
    
        beforeEach(module('parlay.socket'));
        
        describe('ParlaySocket', function () {
            var ParlaySocketService;
            
            beforeEach(inject(function(_ParlaySocketService_) {
                ParlaySocketService = _ParlaySocketService_;
            }));
            
            describe('retrieve a ParlaySocket instance', function () {
                
                it('returns undefined when socket has not been registered', function () {
                    expect(ParlaySocketService).not.toBeUndefined();
                });
                
            });
            
        });
        
    	describe('ParlaySocketService', function () {
    		var ParlaySocketService;
    
    		beforeEach(inject(function(_ParlaySocketService_) {
        		ParlaySocketService = _ParlaySocketService_({
            		openTimeout: 1,
                    closeTimeout: 1,
                    messageInterval: 1
                });
    		}));
    		
    		afterEach(function () {
        		ParlaySocketService.close();
    		});
    		
    		xdescribe('throws exception on invalid configuration', function () {
        		
    		});
    		
    		describe('initialization', function () {
    
    			it('is mock', function () {
        			expect(ParlaySocketService.isMock()).toBeTruthy();
                });
                
                it('is open', function (done) {
                    ParlaySocketService.onOpen(function () {
                        expect(ParlaySocketService.isConnected()).toBeTruthy();
                        done();
                    });                
                });
        
            });
            
            xdescribe('retrieve registered ParlaySocketService', function () {
                
            });
            
            describe('destructs', function () {
                
                it('is closed', function (done) {
                    ParlaySocketService.onOpen(function () {
                        ParlaySocketService.onClose(function () {
                            expect(ParlaySocketService.isConnected()).toBeFalsy();
                            done();
                        });
                        ParlaySocketService.close();
                    });
                    
                });
                
                it('closes and reopens', function (done) {
                    var has_closed = false;
                    
                    ParlaySocketService.onOpen(function () {
                        
                        expect(ParlaySocketService.isConnected()).toBeTruthy();
                        
                        if (has_closed) done();
                        
                        ParlaySocketService.onClose(function () {
                            has_closed = true;
                            expect(ParlaySocketService.isConnected()).toBeFalsy();
                            ParlaySocketService.open();
                        });
                        if (!has_closed) ParlaySocketService.close();
                        
                    });
                });
                
            });
            
            describe('sends', function () {
                
                it('a message', function (done) {
                    ParlaySocketService.sendMessage({"type":"motor"}, {"data":"test"}, {"type":"motor"}, function (response) {
                        expect(response.data).toBe("test");
                        done();
                    });            
                });
                
                it('multiple messages', function (done) {
                    var count = 10;
                    function checkDone (done) {
                        count++;
                        if (count >= 4) done();
                    }
                    
                    ParlaySocketService.sendMessage({"type":"motor"}, {"data":"test"}, {"type":"motor"}, function (response) {
                        expect(response.data).toBe("test");
                        checkDone(done);
                    });
                    ParlaySocketService.sendMessage({"type":"motor"}, {"data":"test"}, {"type":"motor"}, function (response) {
                        expect(response.data).toBe("test");
                        checkDone(done);
                    });
                    ParlaySocketService.sendMessage({"type":"motor"}, {"data":"test"}, {"type":"motor"}, function (response) {
                        expect(response.data).toBe("test");
                        checkDone(done);
                    });
                    ParlaySocketService.sendMessage({"type":"motor"}, {"data":"test"}, {"type":"motor"}, function (response) {
                        expect(response.data).toBe("test");
                        checkDone(done);
                    });
                });
                
                it('includes response topics but not response callback', function() {
                    expect(function () {
                        ParlaySocketService.sendMessage({"type":"motor"}, {"data":"test"}, {"type":"motor"});
                    }).toThrowError(TypeError);
                });
                
                it('includes response callback but not response topics', function() {
                    expect(function () {
                        ParlaySocketService.sendMessage({"type":"motor"}, {"data":"test"}, undefined, function () {});
                    }).toThrowError(TypeError);
                });
                
                it('invalid topics type', function () {
                    expect(function () {
                        ParlaySocketService.sendMessage('test topics');
                    }).toThrowError(TypeError);
                });
                
            });
            
            describe('listens for', function () {
                
                it('a message', function (done) {
                    ParlaySocketService.onMessage({"type":"motor"}, done);
                    ParlaySocketService.sendMessage({"type":"motor"}, {"data":"test"});
                });
                
                it('multiple messages', function (done) {
                    var count = 0;
                    
                    ParlaySocketService.onMessage({"type":"motor"}, function () {
                        count++;
                        if (count === 4) done();
                    });
    
                    ParlaySocketService.sendMessage({"type":"motor"}, {"data":"test"});
                    ParlaySocketService.sendMessage({"type":"motor"}, {"data":"test"});
                    ParlaySocketService.sendMessage({"type":"motor"}, {"data":"test"});
                    ParlaySocketService.sendMessage({"type":"motor"}, {"data":"test"});
                });
                
                it('invalid topics type', function () {
                    expect(function () {
                        ParlaySocketService.onMessage('test topics');
                    }).toThrowError(TypeError);
                });
                
            });
            
            describe('queues', function () {
                
                it('a message', function (done) {
                    ParlaySocketService.sendMessage({"type":"motor"}, {"data":"test"});
                    ParlaySocketService.onMessage({"type":"motor"}, function (response) {
                        expect(response.data).toBe("test");
                        done();
                    });
                });
                
                it('multiple messages', function (done) {
                    var count = 0;
                    for (var i = 0; i < 10; i++) ParlaySocketService.sendMessage({"type":"motor"}, {"data":"test"});
                    ParlaySocketService.onMessage({"type":"motor"}, function (response) {
                        count++;
                        if (count === 10) done();
                    }); 
                });
                
            });
            
            describe('deregisters', function () {
                
                it('one listener', function (done) {
                    
                    var update = false;
                    
                    var registration = ParlaySocketService.onMessage({"type":"motor"}, function () {
                        update = true;
                    });
                    
                    ParlaySocketService.sendMessage({"type":"motor"});
                    
                    setTimeout(function () {
                        expect(update).toBeFalsy();
                        done();
                    }, 100);
                    
                    registration();
                    
                });
                
                it('multiple listeners', function (done) {
                    
                    var registrations = [];
                    var update_count = 0;
                    
                    registrations.push(ParlaySocketService.onMessage({"type":"motor"}, function () {
                        update_count++;
                    }));
                    
                    registrations.push(ParlaySocketService.onMessage({"type":"motor"}, function () {
                        update_count++;
                    }));
                    
                    ParlaySocketService.sendMessage({"type":"motor"});
                    
                    registrations.pop()();
                    
                    setTimeout(function () {
                        expect(update_count).toBe(1);
                        done();
                    }, 100);
                    
                });
                
                it('all listeners', function (done) {
                    var update_count = 0;
                    
                    var registrations = [];
                    
                    function do_update() {
                        update_count++;
                    }
                    
                    for (var i = 0; i < 10; i++) {
                        registrations.push(ParlaySocketService.onMessage({"type":"motor"}, do_update));
                    }
                    
                    while (registrations.length) registrations.pop()();
                                    
                    ParlaySocketService.sendMessage({"type":"motor"});
                    
                    setTimeout(function () {
                        expect(update_count).toBe(0);
                        done();
                    }, 100);
                    
                });
                
            });
            
            describe('encodes', function () {
                
                // NOTE: Encoding is done by sorting topics by comparison of keys in Unicode code point order.
                
                it('strings', function () {
                    expect(ParlaySocketService._private.encodeTopics({"type": "motor"})).toBe('{"type":"motor"}');
                });
                
                it('numbers', function () {
                    expect(ParlaySocketService._private.encodeTopics({"to_device": 22})).toBe('{"to_device":22}');   
                });
                
                it('arrays', function () {
                    expect(ParlaySocketService._private.encodeTopics({"params": []})).toBe('{"params":[]}');
                    expect(ParlaySocketService._private.encodeTopics({"params": [5, 10]})).toBe('{"params":[10,5]}');
                    expect(ParlaySocketService._private.encodeTopics({"params": [{"type":1}, 10]})).toBe('{"params":[10,{"type":1}]}');
                });
                
                it('multiple topics', function () {
                    expect(ParlaySocketService._private.encodeTopics({"type": "motor", "weight":"bold"})).toBe('{"type":"motor","weight":"bold"}');
                });
                
                it('mixed types', function () {
                    expect(ParlaySocketService._private.encodeTopics({"to_device": 22})).toBe('{"to_device":22}');
                });
                
                it('nested', function () {
                    expect(ParlaySocketService._private.encodeTopics({"params": {"port": 22, "socket":"localhost"}, "data": []})).toBe('{"data":[],"params":{"port":22,"socket":"localhost"}}');
                });
                
                it('orders topics consistently', function () {
                    expect(ParlaySocketService._private.encodeTopics({"aaa":0, "bbb":1})).toBe('{"aaa":0,"bbb":1}');
                    expect(ParlaySocketService._private.encodeTopics({"bbb":1, "aaa":0})).toBe('{"aaa":0,"bbb":1}');
                });
                
                it('other type', function () {
                    expect(ParlaySocketService._private.encodeTopics(Boolean(true))).toBe('true');
                });
                
            });
            
            
        		
        });
        
    });
        
}());