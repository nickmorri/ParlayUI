(function () {
    'use strict';

    describe('promenade.items.standarditem', function() {
    
        beforeEach(module('parlay.items'));

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
                    PROPERTIES: [
                        {
                            NAME: "test_property",
                            INPUT: "STRING",
                            READ_ONLY: false
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
            
            it('sends message to protocol', function () {
                
                spyOn(MockProtocol, 'sendMessage').and.callThrough();
                
                item.sendMessage({
                    COMMAND: 'FOO',
                    type: 'int'
                });
                
                rootScope.$apply();
                
                expect(MockProtocol.sendMessage).toHaveBeenCalledWith({
                    TO: 100,
                    MSG_TYPE: 'COMMAND'
                }, {
                    COMMAND: 'FOO',
                    type: 'int'
                }, {}, true);

            });

        });
        
    });
    
}());