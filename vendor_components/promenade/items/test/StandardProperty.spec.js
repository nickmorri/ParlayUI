(function () {
    'use strict';

    describe('promenade.items.property', function () {

        beforeEach(module('promenade.items.property'));

        describe('PromenadeStandardProperty', function () {
            var PromenadeStandardProperty, $q, $rootScope;

            beforeEach(inject(function(_PromenadeStandardProperty_, _$q_, _$rootScope_) {
                PromenadeStandardProperty = _PromenadeStandardProperty_;
                $q = _$q_;
                $rootScope = _$rootScope_;
            }));

            it("creates PromenadeStandardProperty", function () {
                var data = {
                    NAME: "test_property",
                    INPUT: "STRING",
                    READ_ONLY: false
                };

                var protocol = {sendMessage: function () {}, onMessage: function () {}};

                var property = new PromenadeStandardProperty(data, "TestItem", protocol);

                expect(property.name).toBe(data.NAME);
                expect(property.input).toBe(data.INPUT);
                expect(property.read_only).toBe(data.READ_ONLY);
                expect(property.item_name).toBe("TestItem");
            });
            
            it("gets", function (done) {

                var data = {
                    NAME: "test_property",
                    INPUT: "STRING",
                    READ_ONLY: false
                };

                var protocol = {sendMessage: function () {
                    return $q(function (resolve) {
                        resolve({CONTENTS: {VALUE: 10}});
                    });
                }, onMessage: function () {}};
                
                var property = new PromenadeStandardProperty(data, "TestItem", protocol);

                spyOn(protocol, "sendMessage").and.callThrough();

                property.get().then(function (result) {
                    expect(result).toEqual({CONTENTS: {VALUE: 10}});
                    done();
                });

                $rootScope.$apply();

                expect(protocol.sendMessage).toHaveBeenCalledWith({
                    TX_TYPE: "DIRECT",
                    MSG_TYPE: "PROPERTY",
                    TO: "TestItem"
                },
                {
                    PROPERTY: data.NAME,
                    ACTION: "GET",
                    VALUE: null
                },
                {
                    TX_TYPE: "DIRECT",
                    MSG_TYPE: "RESPONSE",
                    FROM: "TestItem",
                    TO: "UI"
                }, true);
                
            });

            it("sets", function () {
                var data = {
                    NAME: "test_property",
                    INPUT: "STRING",
                    READ_ONLY: false
                };

                var protocol = {sendMessage: function () {}, onMessage: function () {}};

                var property = new PromenadeStandardProperty(data, "TestItem", protocol);

                property.value = 10;

                spyOn(protocol, "sendMessage");

                property.set();

                expect(protocol.sendMessage).toHaveBeenCalledWith({
                    TX_TYPE: "DIRECT",
                    MSG_TYPE: "PROPERTY",
                    TO: "TestItem"
                },
                {
                    PROPERTY: data.NAME,
                    ACTION: "SET",
                    VALUE: 10
                },
                {
                    TX_TYPE: "DIRECT",
                    MSG_TYPE: "RESPONSE",
                    FROM: "TestItem",
                    TO: "UI"
                }, true);

            });

        });

    });

}());