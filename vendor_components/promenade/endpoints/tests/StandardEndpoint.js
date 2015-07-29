(function () {
    'use strict';

    describe('promenade.endpoints.standardendpoint', function() {
    
        beforeEach(module('parlay.endpoints'));
        beforeEach(module('RecursionHelper'));
        beforeEach(module('ngMock'));
        
        describe('PromenadeStandardEndpoint', function() {
            var rootScope, endpoint, MockProtocol;
            
            beforeEach(inject(function($rootScope, _PromenadeStandardEndpoint_) {
                /*jshint newcap: false */
                rootScope = $rootScope;
                
                MockProtocol = {
                    data_types: ['int', 'float'],
                    sendCommand: function () {},
                    getMessageId: function () {
                        return 200;
                    },
                    getLog: function () {
                        return [
                            {
                                topics: {
                                    FROM: 100
                                }
                            },
                            {
                                topics: {
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
                    expect(endpoint.log).toEqual([{topics:{FROM:100}}]);
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
                        options: ['option1', 'option2']
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
                
                it('generates message', function () {
                    expect(endpoint.generateMessage({
                        command: 'FOO',
                        type: 'int'
                    })).toEqual({
                        topics: {
                            TO: 100,
                            MSG_TYPE: 'COMMAND'
                        },
                        contents: {
                            COMMAND: 'FOO',
                            type: 'int'
                        }
                    });
                });
                                
            });
            
            it('sends message to protocol', function () {
                
                spyOn(MockProtocol, 'sendCommand');
                
                endpoint.sendMessage({
                    command: 'FOO',
                    type: 'int'
                });
                
                expect(MockProtocol.sendCommand).toHaveBeenCalledWith({
                    topics: {
                        TO: 100,
                        MSG_TYPE: 'COMMAND'
                    },
                    contents: {
                        COMMAND: 'FOO',
                        type: 'int'
                    }
                });
                
            });

        });
        
        describe('PromenadeStandardEndpointCommandController', function () {
            var scope, rootScope, PromenadeStandardEndpointCommandController, timeout;
    
            beforeEach(inject(function($rootScope, $controller, $q, $timeout) {
                rootScope = $rootScope;
    			scope = $rootScope.$new();
    			timeout = $timeout;
    			
    			scope.endpoint = {
                    sendMessage: function (message) {
                        return $q(function (resolve, reject) {
                            if (message.command === 'send') resolve('ok');
                            else reject('error');
                        });
                    }
                };
                
    			PromenadeStandardEndpointCommandController = $controller('PromenadeStandardEndpointCommandController', {$scope: scope});
    		}));
    		
    		it('initial values', function () {
                expect(scope.sending).toBeFalsy();
                expect(scope.message).toEqual({});
    		});
    		
    		describe('sending', function () {
        		
        		it('successfully', function () {
                    scope.message = {command: 'send', test:{}};
                    scope.send();
                    rootScope.$apply();
                    
                    expect(scope.sending).toBeTruthy();
                    timeout.flush();            		
            		expect(scope.sending).toBeFalsy();
        		});
        		
        		it('unsuccessfully', function () {
            		spyOn(console, 'warn');
            		
            		scope.message = {command: 'fail'};
                    scope.send();
                    rootScope.$apply();            		
        		    
        		    expect(console.warn).toHaveBeenCalled();
        		});
            		
            });    		
    		
        });
        
    });
    
}());