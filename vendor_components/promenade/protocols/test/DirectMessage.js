(function () {
    'use strict';

    describe('promenade.protocols.directmessage', function() {
    
        beforeEach(module('promenade.protocols.directmessage'));
        
        describe('PromenadeDirectMessageProtocol', function() {
            var rootScope, protocol, socket;
            
            beforeEach(inject(function($rootScope, _PromenadeDirectMessageProtocol_, _ParlaySocket_) {
                /*jshint newcap: false */
                rootScope = $rootScope;
                protocol = new _PromenadeDirectMessageProtocol_({name: 'TestProtocol', protocol_type: 'TestProtocolType'});
                socket = _ParlaySocket_;
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
                expect(protocol.buildMessageTopics({})).toEqual({
                    MSG_ID: previous_message_id + 1,
                    FROM: 'UI'
                });
            });
            
            it('builds response topics', function () {
                var previous_message_id = protocol.getMessageId();
                expect(protocol.buildResponseTopics({
                    TO: 100,
                    FROM: 'UI',
                    MSG_ID: protocol.consumeMessageId()
                })).toEqual({
                    FROM: 100,
                    TO: 'UI',
                    MSG_ID: previous_message_id + 1
                });
            });
            
            it('sends a message', function () {
                
                spyOn(socket, 'sendMessage');
                
                protocol.sendMessage({
                    TO: 100
                }, {}, {
	                FROM: 100
                });
                
                expect(socket.sendMessage).toHaveBeenCalledWith(jasmine.objectContaining({
	                TO: 100,
                    FROM: "UI",
                    MSG_ID: protocol.getMessageId(),
                }), jasmine.objectContaining({}), jasmine.objectContaining({
					FROM: 100,
                }), jasmine.any(Function),
                true);
                
            });

        });
        
        
    });
    
}());