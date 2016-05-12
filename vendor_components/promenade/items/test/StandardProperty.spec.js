(function () {
    'use strict';

    describe('promenade.items.property', function () {

        beforeEach(module('promenade.items.property'));

        describe('PromenadeStandardProperty', function () {
            var PromenadeStandardProperty, $q, $rootScope, data, protocol, property, triggerOnMessageCallback;

            beforeEach(inject(function(_PromenadeStandardProperty_, _$q_, _$rootScope_) {
                PromenadeStandardProperty = _PromenadeStandardProperty_;
                $q = _$q_;
                $rootScope = _$rootScope_;

                data = {
                    NAME: "test_property",
                    INPUT: "STRING",
                    READ_ONLY: false
                };

                var on_message_callbacks = {};

                triggerOnMessageCallback = function (response_topics, response) {
                    var stringified = JSON.stringify(response_topics);
                    on_message_callbacks[stringified].forEach(function (callback) {
                        callback(response);
                    });
                };

                protocol = {
                    sendMessage: function () {
                        return $q(function (resolve) {
                            resolve({
                                CONTENTS: {
                                    VALUE: 10
                                }
                            });
                        });
                    }, onMessage: function (response_topics, callback) {
                        var stringified = JSON.stringify(response_topics);
                        if (!on_message_callbacks[stringified]) {
                            on_message_callbacks[stringified] = [];
                        }
                        on_message_callbacks[stringified].push(callback);
                    }
                };

                property = new PromenadeStandardProperty(data, "TestItem", protocol);

            }));

            it("creates PromenadeStandardProperty", function () {
                expect(property.name).toBe(data.NAME);
                expect(property.input).toBe(data.INPUT);
                expect(property.read_only).toBe(data.READ_ONLY);
                expect(property.item_name).toBe("TestItem");
            });
            
            it("gets", function (done) {

                spyOn(protocol, "sendMessage").and.callThrough();

                triggerOnMessageCallback({
                    TX_TYPE: "DIRECT",
                    MSG_TYPE: "RESPONSE",
                    FROM: "TestItem",
                    TO: "UI"
                }, {VALUE: 10, PROPERTY: "test_property"});

                property.get().then(function (result) {
                    expect(property.value).toBe(10);
                    expect(result).toEqual({CONTENTS: {VALUE: 10}});
                    done();
                });

                $rootScope.$digest();

                expect(protocol.sendMessage).toHaveBeenCalledWith({
                    TX_TYPE: "DIRECT",
                    MSG_TYPE: "PROPERTY",
                    TO: "TestItem"
                }, {
                    PROPERTY: data.NAME,
                    ACTION: "GET",
                    VALUE: null
                }, {
                    TX_TYPE: "DIRECT",
                    MSG_TYPE: "RESPONSE",
                    FROM: "TestItem",
                    TO: "UI"
                }, true);
                
            });

            it("sets", function () {

                property.value = 10;

                spyOn(protocol, "sendMessage");

                property.set();

                expect(protocol.sendMessage).toHaveBeenCalledWith({
                    TX_TYPE: "DIRECT",
                    MSG_TYPE: "PROPERTY",
                    TO: "TestItem"
                }, {
                    PROPERTY: data.NAME,
                    ACTION: "SET",
                    VALUE: 10
                }, {
                    TX_TYPE: "DIRECT",
                    MSG_TYPE: "RESPONSE",
                    FROM: "TestItem",
                    TO: "UI"
                }, true);

            });

        });

    });

}());