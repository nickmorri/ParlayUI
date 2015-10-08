(function () {
    'use strict';

    describe('promenade.endpoints.standardendpoint', function() {
    
        beforeEach(module('parlay.endpoints'));
        beforeEach(module('RecursionHelper'));
        
        describe('PromenadeStandardEndpoint', function() {
            var rootScope, endpoint, MockProtocol;
            
            beforeEach(inject(function($rootScope, _PromenadeStandardEndpoint_) {
                /*jshint newcap: false */
                rootScope = $rootScope;
                
                MockProtocol = {
                    data_types: ['int', 'float'],
                    sendMessage: function () {},
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
            
            it('sends message to protocol', function () {
                
                spyOn(MockProtocol, 'sendMessage');
                
                endpoint.sendMessage({
                    command: 'FOO',
                    type: 'int'
                });
                
                expect(MockProtocol.sendMessage).toHaveBeenCalledWith({
                    TO: 100,
                    MSG_TYPE: 'COMMAND'
                }, {
                    COMMAND: 'FOO',
                    type: 'int'
                });                
            });

        });
        
    });
    
}());