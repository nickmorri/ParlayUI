(function () {
    'use strict';

    describe('promenade.items.standarditem', function() {
    
        beforeEach(module('parlay.items'));
        beforeEach(module('RecursionHelper'));
        
        describe('PromenadeStandardItem', function() {
            var rootScope, item, MockProtocol;
            
            beforeEach(inject(function($rootScope, _PromenadeStandardItem_, $q) {
                /*jshint newcap: false */
                rootScope = $rootScope;
                
                MockProtocol = {
                    data_types: ['int', 'float'],
                    sendMessage: function (message) {
	                    return $q(function (resolve) {
		                    resolve("");
	                    });
                    },
                    onMessage: function() {
	                    return function() {};
                    },
                    getMessageId: function () {
                        return 200;
                    },
                    getLog: function () {
                        return [
                            {
                                TOPICS: {
                                    FROM: 100
                                }
                            },
                            {
                                TOPICS: {
                                    FROM: 200
                                }
                            }
                        ];
                    }
                };
                
                item = new _PromenadeStandardItem_({
                    NAME: 'TestItem',
                    INTERFACES: [],
                    ID: 100,
                    CONTENT_FIELDS: [
                        {
                            INPUT: 'DROPDOWN',
                            DROPDOWN_OPTIONS: ['option1', 'option2'],
                            MSG_KEY: 'command'
                        },
                        {
                            INPUT: 'DROPDOWN',
                            DROPDOWN_OPTIONS: [
                                ['key1', 100],
                                ['key2', 200],
                                ['key3', 300]
                            ],
                            MSG_KEY: 'event'
                        }
                    ],
                    DATASTREAMS: [
	                    {
		                    ATTR_NAME: "stream1",
							NAME: "stream1",
							UNITS: "ms"
	                    }
                    ]
                }, MockProtocol);
            }));
            
            it('constructs', function () {
                expect(item.name).toBe('TestItem');
                expect(item.interfaces).toEqual([]);
                expect(item.id).toBe(100);
            });
            
            describe('accessors', function () {
                
                it('gets log from protocol', function () {
                    expect(item.log).toEqual([{TOPICS:{FROM:100}}]);
                });
                
                it('query matching', function () {
                    expect(item.matchesQuery('test')).toBeTruthy();
                    expect(item.matchesQuery('Standard')).toBeTruthy();
                    expect(item.matchesQuery(100)).toBeTruthy();
                });
                
                it('gets message id from protocol', function () {
                    expect(item.getMessageId()).toBe(200);
                });
                
                it('gets data types from protocol', function () {
                    expect(item.data_types).toEqual(['int', 'float']);
                });
                
            });
            
            describe('generates direct message info', function () {
                
                it('generates topics', function () {
                    expect(item.generateTopics()).toEqual({
                        TO: 100,
                        MSG_TYPE: 'COMMAND'
                    });
                });
                                
            });
            
            it('sends message to protocol', function (done) {
                
                spyOn(MockProtocol, 'sendMessage').and.callThrough();
                
                item.sendMessage({
                    command: 'FOO',
                    type: 'int'
                }).then(done);
                
                rootScope.$apply();
                
                expect(MockProtocol.sendMessage).toHaveBeenCalledWith({
                    TO: 100,
                    MSG_TYPE: 'COMMAND'
                }, {
                    COMMAND: 'FOO',
                    type: 'int'
                });
                                       
            });
            
            describe("streams", function() {
	            	            
	            it("requests", function(done) {
		            spyOn(MockProtocol, "sendMessage").and.callThrough();
		            spyOn(MockProtocol, "onMessage").and.callThrough();
		            
		            item.requestStream({
			            NAME: "stream1",
			            rate: 1
		            }).then(function() {
			            expect(item.data_streams.stream1.enabled).toBeTruthy();
			            expect(MockProtocol.onMessage).toHaveBeenCalledWith({
				            TX_TYPE: "DIRECT",
						    MSG_TYPE: "STREAM",
						    TO: "UI",
						    FROM: item.id,
						    STREAM: "stream1"
			            }, jasmine.any(Function));
			            expect(item.data_streams.stream1.listener).toEqual(jasmine.any(Function));
			            done();
		            });
		            
		            rootScope.$apply();
		            
		            expect(MockProtocol.sendMessage).toHaveBeenCalledWith({
			            TX_TYPE: 'DIRECT',
			            MSG_TYPE: 'STREAM',
			            TO: 100
		            },
		            {
			            STREAM: "stream1",
			            RATE: 1,
			            VALUE: null
		            }, {
			            TX_TYPE: 'DIRECT',
			            MSG_TYPE: 'STREAM',
			            TO: 'UI',
			            FROM: 100
		            });
	            });
	            
	            it("cancels", function(done) {
		            spyOn(MockProtocol, "sendMessage").and.callThrough();
		            spyOn(MockProtocol, "onMessage").and.callThrough();
		            
		            item.cancelStream({
			            NAME: "stream1"
		            }).then(function() {
			            expect(item.data_streams.stream1.enabled).toBeFalsy();
			            expect(item.data_streams.stream1.listener).toBeUndefined();
			            expect(item.data_streams.stream1.value).toBeUndefined();
			            done();
		            });
		            
		            rootScope.$apply();
		            
		            expect(MockProtocol.sendMessage).toHaveBeenCalledWith({
			            TX_TYPE: 'DIRECT',
			            MSG_TYPE: 'STREAM',
			            TO: 100
		            },
		            {
			            STREAM: "stream1",
			            RATE: 0,
			            VALUE: null
		            }, {
			            TX_TYPE: 'DIRECT',
			            MSG_TYPE: 'STREAM',
			            TO: 'UI',
			            FROM: 100
		            });
	            });
	            
            });
            
            // NOTE: Weird bug happening here if this test suite is executed. Likely will happen on other tests suites too.
            // Seems like toHaveBeenCalled is not being cleared between test suites causing expectations to creep into other test suites.
            
            describe("properties", function() {
	            
	            it("gets", function() {
		            
		            spyOn(MockProtocol, "sendMessage").and.callThrough();
		            
		            item.getProperty({
			            NAME: "property1"
		            });
		            
		            expect(MockProtocol.sendMessage).toHaveBeenCalledWith({
			            TX_TYPE: 'DIRECT',
			            MSG_TYPE: 'PROPERTY',
			            TO: 100
		            },
		            {
			            PROPERTY: "property1",
			            ACTION: "GET",
			            VALUE: null
		            }, {
			            TX_TYPE: 'DIRECT',
			            MSG_TYPE: 'RESPONSE',
			            TO: 'UI',
			            FROM: 100
		            });
	            });
	            
	            it("sets", function() {
		            spyOn(MockProtocol, "sendMessage").and.callThrough();
		            
		            item.setProperty({
			            NAME: "property1",
			            VALUE: 100
		            });
		            
		            expect(MockProtocol.sendMessage).toHaveBeenCalledWith({
			            TX_TYPE: 'DIRECT',
			            MSG_TYPE: 'PROPERTY',
			            TO: 100
		            },
		            {
			            PROPERTY: "property1",
			            ACTION: "SET",
			            VALUE: 100
		            }, {
			            TX_TYPE: 'DIRECT',
			            MSG_TYPE: 'RESPONSE',
			            TO: 'UI',
			            FROM: 100
		            });
	            });
	            
            });

        });
        
    });
    
}());