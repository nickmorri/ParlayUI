(function () {
    'use strict';

    describe('promenade.protocols.directmessage', function() {
    
        beforeEach(module('promenade.protocols.directmessage'));
        
        describe('PromenadeDirectMessageProtocol', function() {
            var rootScope, protocol;
            
            beforeEach(inject(function($rootScope, _PromenadeDirectMessageProtocol_) {
                /*jshint newcap: false */
                rootScope = $rootScope;
                protocol = new _PromenadeDirectMessageProtocol_({name: 'TestProtocol', protocol_type: 'TestProtocolType'});
            }));
            
            it('constructs', function() {
                expect(protocol.current_message_id).toBe(200);
                expect(protocol.id).toBe('UI');
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
                expect(protocol.buildMessageTopics({TOPICS:{}})).toEqual({
                    TOPICS: {
                        MSG_ID: previous_message_id + 1,
                        FROM: 'UI'
                    }
                });
            });
            
            it('builds response topics', function () {
                var previous_message_id = protocol.getMessageId();
                expect(protocol.buildResponseTopics({TOPICS: {
                    TO: 100,
                    FROM: 'UI',
                    MSG_ID: protocol.consumeMessageId()
                }})).toEqual({
                    FROM: 100,
                    TO: 'UI',
                    MSG_ID: previous_message_id + 1
                });
            });

            it('builds subscription topics', function () {
                expect(protocol.buildSubscriptionTopics()).toEqual({TOPICS:{
                    TO: 'UI'
                }});
            });
            
            it('builds subscription listener topics', function () {
                expect(protocol.buildSubscriptionListenerTopics()).toEqual({
                    TO: 'UI'
                });
            });
            
            it('sends a command', function () {
                
                spyOn(protocol, 'sendMessage');
                
                protocol.sendCommand({
                    TOPICS: {
                        TO: 100
                    },
                    CONTENTS: {}
                });
                expect(protocol.sendMessage).toHaveBeenCalledWith({
                        TO: 100,
                        MSG_ID: protocol.getMessageId(),
                        FROM: 'UI'
                    }, {}, {
                        FROM: 100,
                        MSG_ID: protocol.getMessageId(),
                        TO: 'UI'
                    });
                
            });

        });
        
        
    });
    
}());