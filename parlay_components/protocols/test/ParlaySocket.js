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
                expect(container.maxDepth()).toBe(1);
            });

            describe("adds topics callbacks", function () {

                it("empty topic", function () {
                    container.add({}, function () {}, false, false);
                    expect(container.size()).toBe(1);
                    expect(container.maxDepth()).toBe(1);
                });

                it("one topic", function () {
                    container.add({key: 0}, function () {}, false, false);
                    expect(container.size()).toBe(1);
                    expect(container.maxDepth()).toBe(2);
                });

                it("multiple callbacks to same topic", function () {
                    container.add({key: 0}, function () {}, false, false);
                    container.add({key: 0}, function () {}, false, false);
                    container.add({key: 0}, function () {}, false, false);
                    container.add({key: 0}, function () {}, false, false);
                    container.add({key: 0}, function () {}, false, false);
                    expect(container.callbackCount()).toBe(5);
                    expect(container.size()).toBe(1);
                    expect(container.maxDepth()).toBe(2);
                });

                it("multiple callbacks to separate topics", function () {
                    container.add({key: 0}, function () {}, false, false);
                    container.add({key: 1}, function () {}, false, false);
                    container.add({key: 2}, function () {}, false, false);
                    container.add({key: 3}, function () {}, false, false);
                    container.add({key: 4}, function () {}, false, false);
                    expect(container.callbackCount()).toBe(5);
                    expect(container.size()).toBe(5);
                    expect(container.maxDepth()).toBe(2);
                });

                it("callbacks to sub topics", function () {
                    expect(container.maxDepth()).toBe(1);
                    container.add({"first": 1}, function () {});
                    container.add({"test": 1}, function () {});
                    expect(container.callbackCount()).toBe(2);
                    expect(container.size()).toBe(2);
                    expect(container.maxDepth()).toBe(2);
                    container.add({"first": 1, "second": 2}, function () {});
                    container.add({"test": 1, "second": 2}, function () {});
                    expect(container.callbackCount()).toBe(4);
                    expect(container.size()).toBe(4);
                    expect(container.maxDepth()).toBe(3);

                    container.add({"a": 1, "really": 2, "deep": 3, "topic": 4, "chain": 5, "that": 6, "should": 7, "be": 8, "depth": 9, "eleven": 10}, function () {});
                    expect(container.maxDepth()).toBe(11);
                    expect(container.callbackCount()).toBe(5);
                    expect(container.size()).toBe(5);
                });

            });

            describe("removes topics callbacks", function () {

                it("empty topic", function () {
                    var reference = function () {};
                    container.add({}, reference, false, false);
                    expect(container.size()).toBe(1);
                    expect(container.maxDepth()).toBe(1);
                    container.delete({}, reference);
                    expect(container.size()).toBe(0);
                    expect(container.maxDepth()).toBe(1);
                });

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

                it("prunes unused subtrees", function () {

                    expect(container.maxDepth()).toBe(1);

                    var reference_third = function () {};
                    container.add({"first": 1, "second": 2, "third": 3}, reference_third);

                    expect(container.maxDepth()).toBe(4);

                    var reference_second = function () {};
                    container.add({"first": 1, "second": 2}, reference_second);

                    expect(container.maxDepth()).toBe(4);

                    container.delete({"first": 1, "second": 2, "third": 3}, reference_third);
                    expect(container.maxDepth()).toBe(3);
                    container.delete({"first": 1, "second": 2}, reference_second);
                    expect(container.maxDepth()).toBe(1);
                    expect(container.size()).toBe(0);

                    var reference_deep = function () {};
                    container.add({"a": 1, "really": 2, "deep": 3, "topic": 4, "chain": 5, "that": 6, "should": 7, "be": 8, "depth": 9, "eleven": 10}, reference_deep);
                    expect(container.maxDepth()).toBe(11);
                    expect(container.callbackCount()).toBe(1);
                    expect(container.size()).toBe(1);

                    container.delete({"a": 1, "really": 2, "deep": 3, "topic": 4, "chain": 5, "that": 6, "should": 7, "be": 8, "depth": 9, "eleven": 10}, reference_deep);
                    expect(container.maxDepth()).toBe(1);
                    expect(container.callbackCount()).toBe(0);
                    expect(container.size()).toBe(0);

                });

                it("fails appropriately", function () {
                    var reference = function () {};
                    expect(container.delete({}, reference)).toBeFalsy();
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

                it("undefined key/value", function () {

                    var value = 0;

                    container.add({undefined: 1}, function () {
                        value += 10;
                    }, false, false);

                    container.add({key: undefined}, function () {
                        value += 10;
                    }, false, false);

                    container.invoke({undefined: 1}, {});
                    container.invoke({key: undefined}, {});
                    expect(value).toBe(20);

                });

            });

            describe("invokes persistent callbacks", function () {

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

            describe("invokes mixed (temporary and persistent) callbacks", function () {

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
    		var ParlaySocket, MockSocket, $rootScope;

            MockSocket = {
                url: "karma_test",
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
                this.onclose({wasClean: reason && reason.wasClean});
            };

            MockSocket.send = function (message_string) {
                this.onmessage({data: message_string});
            };

            WebSocket = function (address) {
                MockSocket.url = address;
                return MockSocket;
            };

    		beforeEach(inject(function(_ParlaySocket_, _$rootScope_) {
                ParlaySocket = _ParlaySocket_;
                $rootScope = _$rootScope_;
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

                it('opens only once', function () {
                    expect(function () {
                        ParlaySocket.open();
                    }).toThrow();
                });

            });
                        
            describe('destructs', function () {
                
                it('is closed', function (done) {
                    ParlaySocket.onOpen(function () {
                        ParlaySocket.onClose(function () {
                            expect(ParlaySocket.isConnected()).toBeFalsy();
                            done();
                        });
                        ParlaySocket.close({wasClean: true});
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

                        if (!has_closed) ParlaySocket.close(false);
                        
                    });

                    MockSocket.force_open();

                });

                it('was clean close', function (done) {
                    ParlaySocket.onOpen(function () {
                        ParlaySocket.close({wasClean: true}).then(done);
                        $rootScope.$apply();
                    });

                    MockSocket.force_open();
                });

                it('was not clean close', function (done) {
                    ParlaySocket.onOpen(function () {
                        ParlaySocket.close({wasClean: false}).catch(done);
                        $rootScope.$apply();
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

                it('a message with a verbose callback', function (done) {
                    ParlaySocket.sendMessage({"type":"motor"}, {"data":"test"}, {"type":"motor"}, function (response) {
                        expect(response).toEqual({TOPICS: { type: 'motor' }, CONTENTS: { data: 'test' }});
                        done();
                    }, true);
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

                it('rejects promise on exception thrown', function (done) {

                    var saved_send = MockSocket.send;

                    MockSocket.send = function (message) { throw new Error("Arbitrary error."); };

                    ParlaySocket.sendMessage({"type":"motor"}, {"data":"test"}).catch(function (result) {
                        expect(result).toEqual(jasmine.any(Error));
                        done();
                    });

                    MockSocket.send = saved_send;

                    $rootScope.$apply();
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

                it('rejects promise on exception', function (done) {

                    var saved_send = MockSocket.send;

                    MockSocket.send = function (message) { throw new Error("Arbitrary error."); };

                    ParlaySocket.sendMessage({type: "motor"}, {data: "queue"});

                    ParlaySocket.sendMessage({"type":"motor"}, {"data":"queue"}).catch(function (result) {
                        expect(result).toEqual(jasmine.any(Error));
                        done();
                    });

                    MockSocket.force_open();
                    $rootScope.$apply();
                    MockSocket.send = saved_send;

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

        describe('protocol resolution', function () {

            describe('http', function () {
                beforeEach(inject(function (_$location_) {
                    _$location_.protocol = "http:";
                }));

                it('gets address', inject(function (_ParlaySocket_) {
                    ParlaySocket = _ParlaySocket_;

                    expect(ParlaySocket.getAddress()).toBe('ws://localhost:8085');

                }));
            });

            describe('https', function () {
                beforeEach(inject(function (_$location_) {
                    _$location_.protocol = "https:";
                }));

                it('gets address https', inject(function (_ParlaySocket_) {
                    ParlaySocket = _ParlaySocket_;

                    expect(ParlaySocket.getAddress()).toBe('wss://localhost:8086');

                }));
            });

        });

        it('BrokerAddress', inject(function (_BrokerAddress_) {
            expect(_BrokerAddress_).toBe('localhost');
        }));

    });
        
}());