(function () {
    'use strict';

    describe('promenade.endpoints.standardendpoint', function() {
    
        beforeEach(module('parlay.endpoints'));
        beforeEach(module('RecursionHelper'));
        
        describe('PromenadeStandardEndpoint', function() {
            var rootScope, endpoint, MockProtocol;
            
            beforeEach(inject(function($rootScope, _PromenadeStandardEndpoint_, $q) {
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
                
                endpoint = new _PromenadeStandardEndpoint_({
                    NAME: 'TestEndpoint',
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
                expect(endpoint.name).toBe('TestEndpoint');
                expect(endpoint.interfaces).toEqual([]);
                expect(endpoint.id).toBe(100);
            });
            
            describe('accessors', function () {
                
                it('gets log from protocol', function () {
                    expect(endpoint.log).toEqual([{TOPICS:{FROM:100}}]);
                });
                
                it('query matching', function () {
                    expect(endpoint.matchesQuery('test')).toBeTruthy();
                    expect(endpoint.matchesQuery('Standard')).toBeTruthy();
                    expect(endpoint.matchesQuery(100)).toBeTruthy();
                });
                
                it('gets message id from protocol', function () {
                    expect(endpoint.getMessageId()).toBe(200);
                });
                
                it('gets commands', function () {
                    expect(endpoint.commands).toEqual({
                        msg_key: 'command',
                        label: 'command',
                        required: false,
                        default: undefined,
                        hidden: false,
                        input: 'DROPDOWN',
                        options: [{
							name: "option1",
							value: "option1",
							sub_fields: undefined
						}, {
							name: "option2",
							value: "option2",
							sub_fields: undefined
						}]
                    });
                });
                
                it('gets data types from protocol', function () {
                    expect(endpoint.data_types).toEqual(['int', 'float']);
                });
                
            });
            
            describe('generates direct message info', function () {
                
                it('generates topics', function () {
                    expect(endpoint.generateTopics()).toEqual({
                        TO: 100,
                        MSG_TYPE: 'COMMAND'
                    });
                });
                
                it('generates contents', function () {
                    expect(endpoint.generateContents({
                        command: 'FOO',
                        type: 'int'
                    })).toEqual({
                        COMMAND: 'FOO',
                        type: 'int'
                    });
                });
                                
            });
            
            it('sends message to protocol', function (done) {
                
                spyOn(MockProtocol, 'sendMessage').and.callThrough();
                
                endpoint.sendMessage({
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
		            
		            endpoint.requestStream({
			            NAME: "stream1",
			            rate: 1
		            }).then(function() {
			            expect(endpoint.data_streams.stream1.enabled).toBeTruthy();
			            expect(MockProtocol.onMessage).toHaveBeenCalledWith({
				            TX_TYPE: "DIRECT",
						    MSG_TYPE: "STREAM",
						    TO: "UI",
						    FROM: endpoint.id,
						    STREAM: "stream1"
			            }, jasmine.any(Function));
			            expect(endpoint.data_streams.stream1.listener).toEqual(jasmine.any(Function));
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
		            
		            endpoint.cancelStream({
			            NAME: "stream1"
		            }).then(function() {
			            expect(endpoint.data_streams.stream1.enabled).toBeFalsy();
			            expect(endpoint.data_streams.stream1.listener).toBeUndefined();
			            expect(endpoint.data_streams.stream1.value).toBeUndefined();
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
            
            xdescribe("properties", function() {
	            
	            it("gets", function() {
		            
		            spyOn(MockProtocol, "sendMessage");
		            
		            endpoint.getProperty({
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
		            
		            endpoint.setProperty({
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