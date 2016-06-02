(function () {
    'use strict';

    describe('promenade.items.datastream', function () {

        beforeEach(module('promenade.items.datastream'));

        describe('PromenadeStandardDatastream', function () {
            var PromenadeStandardDatastream;

            beforeEach(inject(function(_PromenadeStandardDatastream_) {
                PromenadeStandardDatastream = _PromenadeStandardDatastream_;
            }));
            
            it("creates PromenadeStandardDatastream", function () {
                
                var data = {NAME: "datastream"};
                var protocol = { onMessage: function () {}, sendMessage: function () {} };
                spyOn(protocol, "onMessage");

                var datastream = new PromenadeStandardDatastream(data, "TestItem", protocol);

                expect(datastream.name).toBe(data.NAME);
                expect(datastream.item_name).toBe("TestItem");
                expect(datastream.protocol).toBe(protocol);
                expect(protocol.onMessage).toHaveBeenCalledWith({
                    TX_TYPE: "DIRECT",
                    MSG_TYPE: "STREAM",
                    TO: "UI",
                    FROM: "TestItem",
                    STREAM: data.NAME
                }, jasmine.any(Function));

            });

            it("starts listening", function () {
                var data = {NAME: "datastream"};
                var protocol = { onMessage: function () {}, sendMessage: function () {} };
                var datastream = new PromenadeStandardDatastream(data, "TestItem", protocol);

                spyOn(protocol, "sendMessage");

                datastream.listen(false);

                expect(protocol.sendMessage).toHaveBeenCalledWith({
                    TX_TYPE: "DIRECT",
                    MSG_TYPE: "STREAM",
                    TO: "TestItem"
                },
                {
                    STREAM: data.NAME,
                    STOP: false
                },
                {
                    TX_TYPE: "DIRECT",
                    MSG_TYPE: "STREAM",
                    TO: "UI",
                    FROM: "TestItem"
                });
            });

            it("stops listening", function () {
                var data = {NAME: "datastream"};
                var protocol = { onMessage: function () {}, sendMessage: function () {} };
                var datastream = new PromenadeStandardDatastream(data, "TestItem", protocol);

                spyOn(protocol, "sendMessage");

                datastream.listen(true);

                expect(protocol.sendMessage).toHaveBeenCalledWith({
                    TX_TYPE: "DIRECT",
                    MSG_TYPE: "STREAM",
                    TO: "TestItem"
                },
                {
                    STREAM: data.NAME,
                    STOP: true
                },
                {
                    TX_TYPE: "DIRECT",
                    MSG_TYPE: "STREAM",
                    TO: "UI",
                    FROM: "TestItem"
                });
            });

            it("updates value", function () {

                var stored_callback;

                var datastream = new PromenadeStandardDatastream({NAME: "datastream"}, "TestItem", { onMessage: function (topics, callback) {
                    stored_callback = callback;
                }});

                expect(datastream.value).toBeUndefined();
                stored_callback({VALUE: 10});
                expect(datastream.value).toBe(10);
            });
            
        });

    });

}());