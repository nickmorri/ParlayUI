(function () {
    'use strict';

    describe('promenade.protocols.directmessage', function() {
    
        beforeEach(module('parlay.protocols'));
        beforeEach(module('promenade.endpoints.standardendpoint'));
        
        describe('PromenadeDirectMessageProtocol', function() {
            var rootScope, protocol;
            
            beforeEach(inject(function($rootScope, _PromenadeDirectMessageProtocol_) {
                /*jshint newcap: false */
                rootScope = $rootScope;
                protocol = new _PromenadeDirectMessageProtocol_({name: 'TestProtocol', protocol_type: 'TestProtocolType'});
            }));
            
            it('constructs', function() {
                expect(protocol.current_message_id).toBe(200);
                expect(protocol.id).toBe(0xf201);
            });
            
            it('gets message id', function () {
                expect(protocol.getMessageId()).toBe(200);
            });
            
            it('consumes message id', function () {
                var previous_message_id = protocol.getMessageId();
                expect(protocol.consumeMessageId()).toBe(previous_message_id + 1);
                expect(protocol.consumeMessageId()).toBe(previous_message_id + 2);
            });
            
            it('builds message topics', function () {
                var previous_message_id = protocol.getMessageId();
                expect(protocol.buildMessageTopics({topics:{}})).toEqual({
                    topics: {
                        MSG_ID: previous_message_id + 1,
                        FROM: 0xf201
                    }
                });
            });
            
            it('builds response topics', function () {
                var previous_message_id = protocol.getMessageId();
                expect(protocol.buildResponseTopics({topics: {
                    TO: 100,
                    FROM: 0xf201,
                    MSG_ID: protocol.consumeMessageId()
                }})).toEqual({
                    FROM: 100,
                    TO: 0xf201,
                    MSG_ID: previous_message_id + 1
                });
            });

            it('builds subscription topics', function () {
                expect(protocol.buildSubscriptionTopics()).toEqual({topics:{
                    TO: 0xf201
                }});
            });
            
            it('builds subscription listener topics', function () {
                expect(protocol.buildSubscriptionListenerTopics()).toEqual({
                    TO: 0xf201
                });
            });
            
            it('sends a command', function () {
                
                spyOn(protocol, 'sendMessage');
                
                protocol.sendCommand({
                    topics: {
                        TO: 100
                    },
                    contents: {}
                });
                expect(protocol.sendMessage).toHaveBeenCalledWith({
                        TO: 100,
                        MSG_ID: protocol.getMessageId(),
                        FROM: 0xf201                        
                    }, {}, {
                        FROM: 100,
                        MSG_ID: protocol.getMessageId(),
                        TO: 0xf201                        
                    });
                
            });

        });
        
        
    });
    
}());