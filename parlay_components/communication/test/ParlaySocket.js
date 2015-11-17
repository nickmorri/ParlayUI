(function () {
    'use strict';
    
    describe('parlay.socket', function() {
    
        beforeEach(module('parlay.socket'));

        describe("CallbackContainer", function () {

            var container;

            beforeEach(inject(function (CallbackContainer) {
                container = new CallbackContainer();
            }));

            it("starts empty", function () {
                expect(container.size()).toBe(0);
                expect(container.callbackCount()).toBe(0);
            });

            describe("adds topics callbacks", function () {

                it("one topic", function () {
                    container.add({key: 0}, function () {}, false, false);
                    expect(container.size()).toBe(1);
                });

                it("multiple callbacks to same topic", function () {
                    container.add({key: 0}, function () {}, false, false);
                    container.add({key: 0}, function () {}, false, false);
                    container.add({key: 0}, function () {}, false, false);
                    container.add({key: 0}, function () {}, false, false);
                    container.add({key: 0}, function () {}, false, false);
                    expect(container.callbackCount()).toBe(5);
                    expect(container.size()).toBe(1);
                });

                it("multiple callbacks to separate topics", function () {
                    container.add({key: 0}, function () {}, false, false);
                    container.add({key: 1}, function () {}, false, false);
                    container.add({key: 2}, function () {}, false, false);
                    container.add({key: 3}, function () {}, false, false);
                    container.add({key: 4}, function () {}, false, false);
                    expect(container.callbackCount()).toBe(5);
                    expect(container.size()).toBe(5);
                });

            });

            describe("removes topics callbacks", function () {

                it("one topic callback", function () {
                    var reference = function () {};
                    container.add({key: 0}, reference, false, false);
                    expect(container.size()).toBe(1);
                    container.delete({key: 0}, reference);
                    expect(container.size()).toBe(0);
                });

                it("multiple callbacks same topic", function () {
                    var references = [];

                    for (var i = 0; i < 5; i++) {
                        references[i] = function () {};
                        container.add({key: 0}, references[i], false, false);
                    }

                    expect(container.callbackCount()).toBe(5);
                    expect(container.size()).toBe(1);

                    references.forEach(function (reference) {
                        container.delete({key: 0}, reference);
                    });

                    expect(container.callbackCount()).toBe(0);
                    expect(container.size()).toBe(0);

                });

                it("multiple callbacks different topics", function () {
                    var references = [];

                    for (var i = 0; i < 5; i++) {
                        references[i] = function () {};
                        container.add({key: i}, references[i], false, false);
                    }

                    expect(container.callbackCount()).toBe(5);
                    expect(container.size()).toBe(5);

                    references.forEach(function (reference, index) {
                        container.delete({key: index}, reference);
                    });

                    expect(container.callbackCount()).toBe(0);
                    expect(container.size()).toBe(0);
                });

            });

            describe("invokes temporary callbacks", function () {

                it("one topic one callback", function (done) {
                    container.add({key: 0}, function (contents) {
                        expect(contents).toEqual({data: 100});
                        done();
                    }, false, false);

                    expect(container.size()).toBe(1);
                    container.invoke({key: 0}, {data: 100});
                });

                it("one topic multiple callbacks", function () {

                    var count = 0;

                    function checkDone() {
                        count++;
                    }

                    container.add({key: 0}, checkDone, false, false);
                    container.add({key: 0}, checkDone, false, false);
                    container.add({key: 0}, checkDone, false, false);

                    expect(container.size()).toBe(1);
                    expect(container.callbackCount()).toBe(3);
                    container.invoke({key: 0}, {});

                    expect(count).toBe(3);

                    expect(container.size()).toBe(0);
                    expect(container.callbackCount()).toBe(0);
                });

                it("multiple topics", function () {

                    var value = 0;

                    function checkDone(contents) {
                        value += contents.value;
                    }

                    container.add({key: 0}, checkDone, false, false);
                    container.add({key: 1}, checkDone, false, false);
                    container.add({key: 2}, checkDone, false, false);

                    expect(container.size()).toBe(3);
                    expect(container.callbackCount()).toBe(3);

                    container.invoke({key: 0}, {value: 10});

                    expect(value).toBe(10);

                    expect(container.size()).toBe(2);
                    expect(container.callbackCount()).toBe(2);

                    container.invoke({key: 1}, {value: 10});

                    expect(value).toBe(20);

                    expect(container.size()).toBe(1);
                    expect(container.callbackCount()).toBe(1);

                    container.invoke({key: 2}, {value: 10});

                    expect(value).toBe(30);

                    expect(container.size()).toBe(0);
                    expect(container.callbackCount()).toBe(0);

                });

                it("overlapping topics", function () {

                    var value = 0;

                    container.add({key: "value"}, function () {
                        value += 10;
                    }, false, false);

                    container.add({key: "value", test: "value"}, function () {
                        value += 10;
                    }, false, false);

                    container.invoke({key: "value", test: "value"}, {value: 10});
                    expect(value).toBe(20);

                });

            });

            describe("invokes persistant callbacks", function () {

                it("one topic one callback", function () {

                    var called = 0;

                    container.add({key: 0}, function (contents) {
                        called++;
                    }, true, false);

                    expect(container.size()).toBe(1);
                    container.invoke({key: 0}, {data: 100});
                    container.invoke({key: 0}, {data: 100});
                    container.invoke({key: 0}, {data: 100});
                    expect(container.size()).toBe(1);
                    expect(called).toBe(3);
                });

                it("one topic multiple callbacks", function () {

                    var count = 0;

                    function checkDone() {
                        count++;
                    }

                    container.add({key: 0}, checkDone, true, false);
                    container.add({key: 0}, checkDone, true, false);
                    container.add({key: 0}, checkDone, true, false);

                    expect(container.size()).toBe(1);
                    expect(container.callbackCount()).toBe(3);

                    container.invoke({key: 0}, {});

                    expect(count).toBe(3);

                    expect(container.size()).toBe(1);
                    expect(container.callbackCount()).toBe(3);

                    container.invoke({key: 0}, {});

                    expect(count).toBe(6);

                    expect(container.size()).toBe(1);
                    expect(container.callbackCount()).toBe(3);
                });

                it("multiple topics", function () {

                    var value = 0;

                    function checkDone(contents) {
                        value += contents.value;
                    }

                    container.add({key: 0}, checkDone, true, false);
                    container.add({key: 1}, checkDone, true, false);
                    container.add({key: 2}, checkDone, true, false);

                    expect(container.size()).toBe(3);
                    expect(container.callbackCount()).toBe(3);

                    container.invoke({key: 0}, {value: 10});

                    expect(value).toBe(10);

                    expect(container.size()).toBe(3);
                    expect(container.callbackCount()).toBe(3);

                    container.invoke({key: 1}, {value: 10});

                    expect(value).toBe(20);

                    expect(container.size()).toBe(3);
                    expect(container.callbackCount()).toBe(3);

                    container.invoke({key: 2}, {value: 10});

                    expect(value).toBe(30);

                    expect(container.size()).toBe(3);
                    expect(container.callbackCount()).toBe(3);

                    container.invoke({key: 0}, {value: 10});
                    container.invoke({key: 1}, {value: 10});
                    container.invoke({key: 2}, {value: 10});

                    expect(value).toBe(60);

                });

                it("overlapping topics", function () {

                    var value = 0;

                    container.add({key: "value"}, function () {
                        value += 10;
                    }, true, false);

                    container.add({key: "value", test: "value"}, function () {
                        value += 10;
                    }, true, false);

                    container.invoke({key: "value"}, {value: 10});

                    expect(value).toBe(10);

                    container.invoke({key: "value", test: "value"}, {value: 10});

                    expect(value).toBe(30);

                    container.invoke({key: "value"}, {value: 10});

                    expect(value).toBe(40);

                    container.invoke({key: "value", test: "value"}, {value: 10});

                    expect(value).toBe(60);

                });

            });

            describe("invokes mixed (temporary and persistant) callbacks", function () {

                it("one topic multiple callbacks", function () {

                    var count = 0;

                    function checkDone() {
                        count++;
                    }

                    container.add({key: 0}, checkDone, true, false);
                    container.add({key: 0}, checkDone, false, false);
                    container.add({key: 0}, checkDone, false, false);

                    expect(container.size()).toBe(1);
                    expect(container.callbackCount()).toBe(3);

                    container.invoke({key: 0}, {});

                    expect(count).toBe(3);

                    expect(container.size()).toBe(1);
                    expect(container.callbackCount()).toBe(1);

                    container.invoke({key: 0}, {});

                    expect(count).toBe(4);

                    expect(container.size()).toBe(1);
                    expect(container.callbackCount()).toBe(1);
                });

                it("multiple topics", function () {

                    var value = 0;

                    function checkDone(contents) {
                        value += contents.value;
                    }

                    container.add({key: 0}, checkDone, true, false);
                    container.add({key: 1}, checkDone, false, false);
                    container.add({key: 2}, checkDone, false, false);

                    expect(container.size()).toBe(3);
                    expect(container.callbackCount()).toBe(3);

                    container.invoke({key: 0}, {value: 10});

                    expect(value).toBe(10);

                    expect(container.size()).toBe(3);
                    expect(container.callbackCount()).toBe(3);

                    container.invoke({key: 1}, {value: 10});

                    expect(value).toBe(20);

                    expect(container.size()).toBe(2);
                    expect(container.callbackCount()).toBe(2);

                    container.invoke({key: 2}, {value: 10});

                    expect(value).toBe(30);

                    expect(container.size()).toBe(1);
                    expect(container.callbackCount()).toBe(1);

                    container.invoke({key: 0}, {value: 10});
                    container.invoke({key: 1}, {value: 10});
                    container.invoke({key: 2}, {value: 10});

                    expect(value).toBe(40);

                });

                it("overlapping topics", function () {

                    var value = 0;

                    container.add({key: "value"}, function () {
                        value += 10;
                    }, false, false);

                    container.add({key: "value", test: "value"}, function () {
                        value += 10;
                    }, true, false);

                    container.invoke({key: "value"}, {value: 10});

                    expect(value).toBe(10);
                    expect(container.size()).toBe(1);
                    expect(container.callbackCount()).toBe(1);

                    container.invoke({key: "value", test: "value"}, {value: 10});

                    expect(value).toBe(20);
                    expect(container.size()).toBe(1);
                    expect(container.callbackCount()).toBe(1);

                    container.invoke({key: "value"}, {value: 10});

                    expect(value).toBe(20);
                    expect(container.size()).toBe(1);
                    expect(container.callbackCount()).toBe(1);

                    container.invoke({key: "value", test: "value"}, {value: 10});

                    expect(value).toBe(30);
                    expect(container.size()).toBe(1);
                    expect(container.callbackCount()).toBe(1);

                });

            });

        });

    	describe('ParlaySocket', function () {
    		var ParlaySocket, MockSocket;

            MockSocket = {
                readyState: 3,
                CONNECTING: 0,
                OPEN: 1,
                CLOSING: 2,
                CLOSED: 3
            };

            MockSocket.force_open = function () {
                this.readyState = this.OPEN;
                this.onopen();
            };

            MockSocket.close = function (reason) {
                this.readyState = this.CLOSED;
                this.onclose({wasClean: false});
            };

            MockSocket.send = function (message_string) {
                this.onmessage({data: message_string});
            };

            WebSocket = function () {
                return MockSocket;
            };

    		beforeEach(inject(function(_$timeout_, _ParlaySocket_) {
                ParlaySocket = _ParlaySocket_;
    		}));

    		describe('initialization', function () {

                it('is open', function (done) {
                    expect(ParlaySocket.isConnected()).toBeFalsy();
                    ParlaySocket.onOpen(function () {
                        expect(ParlaySocket.isConnected()).toBeTruthy();
                        done();
                    });

                    MockSocket.force_open();

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

                    MockSocket.force_open();

                });
                
                it('closes and reopens', function (done) {
                    var has_closed = false;
                    
                    ParlaySocket.onOpen(function () {
                        
                        expect(ParlaySocket.isConnected()).toBeTruthy();
                        
                        if (has_closed) done();
                        
                        ParlaySocket.onClose(function () {
                            has_closed = true;
                            expect(ParlaySocket.isConnected()).toBeFalsy();
                            ParlaySocket.open();
                            MockSocket.force_open();
                        });

                        if (!has_closed) ParlaySocket.close();
                        
                    });

                    MockSocket.force_open();

                });
                
            });
            
            describe('sends', function () {

                beforeEach(function () {
                    MockSocket.force_open();
                });

                it('a message', function (done) {
                    ParlaySocket.sendMessage({"type":"motor"}, {"data":"test"}, {"type":"motor"}, function (response) {
                        expect(response.data).toBe("test");
                        done();
                    });
                });
                
                it('a message with topics but without contents', function (done) {
                    ParlaySocket.sendMessage({"type":"motor"}, undefined, {"type":"motor"}, function (response) {
                        expect(response).toEqual({});
                        done();    
                    });
                });
                
                it('multiple messages', function (done) {
                    var count = 0;
                    function checkDone (done) {
                        count++;
                        if (count >= 4) done();
                    }

                    ParlaySocket.sendMessage({"type":"motor"}, {"data":"test"}, {"type":"motor"}, function (response) {
                        expect(response.data).toBe("test");
                        checkDone(done);
                    });
                    ParlaySocket.sendMessage({"type":"motor"}, {"data":"test"}, {"type":"motor"}, function (response) {
                        expect(response.data).toBe("test");
                        checkDone(done);
                    });
                    ParlaySocket.sendMessage({"type":"motor"}, {"data":"test"}, {"type":"motor"}, function (response) {
                        expect(response.data).toBe("test");
                        checkDone(done);
                    });
                    ParlaySocket.sendMessage({"type":"motor"}, {"data":"test"}, {"type":"motor"}, function (response) {
                        expect(response.data).toBe("test");
                        checkDone(done);
                    });
                });
                
                it('includes response topics but not response callback', function() {
                    expect(function () {
                        ParlaySocket.sendMessage({"type":"motor"}, {"data":"test"}, {"type":"motor"});
                    }).toThrowError(TypeError);
                });
                
                it('includes response callback but not response topics', function() {
                    expect(function () {
                        ParlaySocket.sendMessage({"type":"motor"}, {"data":"test"}, undefined, function () {});
                    }).toThrowError(TypeError);
                });
                
                it('invalid topics type', function () {
                    expect(function () {
                        ParlaySocket.sendMessage('test topics');
                    }).toThrowError(TypeError);
                });
                
                it('invalid contents type', function () {
                    expect(function () {
                        ParlaySocket.sendMessage({"type":"motor"}, 0, {"type":"motor"}, function (response) {});
                    }).toThrowError(TypeError);
                });
                
            });
            
            describe('listens for', function () {

                beforeEach(function () {
                    MockSocket.force_open();
                });
                
                it('a message', function (done) {
                    ParlaySocket.onMessage({"type":"motor"}, function (response) {
                        expect(response.data).toBe("test");
                        done();
                    });
                    MockSocket.force_open();
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
                
                it('invalid topics type', function () {
                    expect(function () {
                        ParlaySocket.onMessage('test topics');
                    }).toThrowError(TypeError);
                });
                
                it('verbose message', function (done) {
                    ParlaySocket.onMessage({"type":"motor"}, function (response) {
                        expect(response.TOPICS).toEqual({"type":"motor"});
                        expect(response.CONTENTS).toEqual({"data":"test"});
                        done();
                    }, true);
                    ParlaySocket.sendMessage({"type":"motor"}, {"data":"test"});
                });
                
                it('subset of a message', function (done) {
                    ParlaySocket.onMessage({"subtype":"stepper"}, function (response) {
                        expect(response.data).toBe(10);
                        done();
                    });
                    ParlaySocket.sendMessage({"type":"motor","subtype":"stepper","from_device":1,"from_system":10}, {"data": 10});
                });
                
            });
            
            describe('queues', function () {

                beforeEach(function () {
                    MockSocket.close();
                });
                
                it('a message', function (done) {

                    ParlaySocket.sendMessage({type: "motor"}, {data: "queue"});

                    ParlaySocket.onMessage({type: "motor"}, function (response) {
                        expect(response.data).toBe("queue");
                        done();
                    });

                    MockSocket.force_open();

                });
                
                it('multiple messages', function (done) {
                    var count = 0;

                    for (var i = 0; i < 10; i++) {
                        ParlaySocket.sendMessage({"type":"motor"}, {"data":"test"});
                    }

                    ParlaySocket.onMessage({"type":"motor"}, function () {
                        count++;
                        if (count === 10) done();
                    });

                    MockSocket.force_open();

                });
                
            });
            
            describe('deregisters', function () {

                beforeEach(function () {
                    MockSocket.force_open();
                });
                
                it('one listener', function (done) {
                    
                    var update = false;
                    
                    ParlaySocket.onMessage({type: "motor"}, function () {
                        update = true;
                    })();

                    ParlaySocket.sendMessage({type: "motor"});
                    
                    setTimeout(function () {
                        expect(update).toBeFalsy();
                        done();
                    }, 100);
                    
                });
                
                it('multiple listeners', function (done) {
                    
                    var registrations = [];
                    var update_count = 0;
                    
                    registrations.push(ParlaySocket.onMessage({type: "motor"}, function () {
                        update_count++;
                    }));
                    
                    registrations.push(ParlaySocket.onMessage({type: "motor"}, function () {
                        update_count++;
                    }));

                    registrations.pop()();

                    ParlaySocket.sendMessage({type: "motor"});
                    
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
                        registrations.push(ParlaySocket.onMessage({"type":"motor"}, do_update));
                    }

                    while (registrations.length) registrations.pop()();

                    ParlaySocket.sendMessage({"type":"motor"});
                    
                    setTimeout(function () {
                        expect(update_count).toBe(0);
                        done();
                    }, 100);
                    
                });
                
            });
        		
        });
        
    });
        
}());