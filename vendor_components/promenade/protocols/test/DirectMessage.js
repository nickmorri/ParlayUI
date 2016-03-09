(function () {
    'use strict';

    describe('promenade.protocols.directmessage', function() {
    
        beforeEach(module('promenade.protocols.directmessage'));
        beforeEach(module('mock.parlay.socket'));
        
        describe('PromenadeDirectMessageProtocol', function() {
            var $rootScope, protocol, socket, $q;
            
            beforeEach(inject(function(_$rootScope_, _$q_,  _PromenadeDirectMessageProtocol_, _ParlaySocket_) {
                /*jshint newcap: false */
                $rootScope = _$rootScope_;
                $q = _$q_;
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
                }, {}, true)).toEqual({
                    FROM: 100,
                    TO: 'UI',
                    MSG_ID: previous_message_id + 1
                });
            });
            
            describe('sends a message', function () {

                it("resolves", function (done) {
                    spyOn(socket, 'sendMessage').and.callThrough();
                    spyOn(protocol, "buildMessageTopics").and.callThrough();
                    spyOn(protocol, "buildResponseTopics").and.callThrough();

                    protocol.sendMessage({TO: 100}, {}, {FROM: 100}, false).then(done);

                    $rootScope.$apply();

                    expect(protocol.buildMessageTopics).toHaveBeenCalledWith({TO: 100});
                    expect(protocol.buildResponseTopics).toHaveBeenCalledWith({TO: 100, MSG_ID: 201, FROM: 'UI'}, {FROM: 100}, false);

                    expect(socket.sendMessage).toHaveBeenCalledWith(jasmine.objectContaining({
                            TO: 100,
                            FROM: "UI",
                            MSG_ID: protocol.getMessageId(),
                        }), jasmine.objectContaining({}), jasmine.objectContaining({
                            FROM: 100
                        }), jasmine.any(Function),
                        true);
                });

                it("rejects", function (done) {
                    spyOn(socket, 'sendMessage').and.callThrough();
                    spyOn(protocol, "buildMessageTopics").and.callThrough();
                    spyOn(protocol, "buildResponseTopics").and.callThrough();

                    protocol.sendMessage({TO: 100}, {}, {FROM: 200}, false).catch(done);

                    $rootScope.$apply();

                    expect(protocol.buildMessageTopics).toHaveBeenCalledWith({TO: 100});
                    expect(protocol.buildResponseTopics).toHaveBeenCalledWith({TO: 100, MSG_ID: 201, FROM: 'UI'}, {FROM: 200}, false);

                    expect(socket.sendMessage).toHaveBeenCalledWith(jasmine.objectContaining({
                            TO: 100,
                            FROM: "UI",
                            MSG_ID: protocol.getMessageId(),
                        }), jasmine.objectContaining({}), jasmine.objectContaining({
                            FROM: 200
                        }), jasmine.any(Function),
                        true);
                });
                
            });

            it("checks if response is ok", function () {
                expect(protocol.isResponseOk({TOPICS: {MSG_STATUS: "ERROR"}})).toBeFalsy();
                expect(protocol.isResponseOk({TOPICS: {MSG_STATUS: "WARNING"}})).toBeFalsy();
                expect(protocol.isResponseOk({TOPICS: {MSG_STATUS: "OK"}})).toBeTruthy();
            });

        });
        
        
    });
    
}());