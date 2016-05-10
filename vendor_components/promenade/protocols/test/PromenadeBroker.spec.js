(function () {
    "use strict";
    
    describe("promenade.broker", function() {
        
        beforeEach(module("promenade.broker"));
        beforeEach(module("parlay.settings"));
        beforeEach(module("mock.parlay.socket"));
        beforeEach(module("parlay.notification"));
        beforeEach(module("parlay.notification.error"));
        
        describe("PromenadeBroker", function () {
            var PromenadeBroker, ParlaySettings, ParlaySocket, ParlayErrorDialog, ParlayNotification, $q, $timeout, $rootScope;
            
            beforeEach(inject(function(_$rootScope_, _$q_, _$timeout_, _ParlaySocket_, _ParlaySettings_, _PromenadeBroker_, _ParlayErrorDialog_, _ParlayNotification_) {
                $rootScope = _$rootScope_;
                $q =_$q_;
                $timeout = _$timeout_;
                ParlaySocket = _ParlaySocket_;
                ParlaySettings = _ParlaySettings_;
                PromenadeBroker = _PromenadeBroker_;
                ParlayErrorDialog = _ParlayErrorDialog_;
                ParlayNotification = _ParlayNotification_;
            }));

            describe("settings registration", function () {});

            describe("constructor", function () {

                it("initial closure scope variables", function () {
                    expect(PromenadeBroker.hasConnectedPreviously()).toBeFalsy();
                    expect(PromenadeBroker.getLastDiscovery()).toBeUndefined();
                    expect(PromenadeBroker.invokeDiscoveryCallbacks({discovery:{}})).toBe(1);
                });

                describe("methods", function () {

                    it("onDiscovery", function () {

                        var callback = jasmine.createSpy("discoveryCallback");

                        PromenadeBroker.onDiscovery(callback);

                        ParlaySocket.triggerOnMessage({"response": "get_discovery_response"}, {}, {discovery:{}});

                        expect(callback).toHaveBeenCalled();

                    });

                    it("invokeDiscoveryCallbacks", function () {
                        var callback1 = jasmine.createSpy("discoveryCallback1");
                        var callback2 = jasmine.createSpy("discoveryCallback2");
                        var callback3 = jasmine.createSpy("discoveryCallback3");

                        PromenadeBroker.onDiscovery(callback1);
                        PromenadeBroker.onDiscovery(callback2);
                        PromenadeBroker.onDiscovery(callback3);

                        PromenadeBroker.invokeDiscoveryCallbacks({discovery: {}});

                        expect(callback1).toHaveBeenCalled();
                        expect(callback2).toHaveBeenCalled();
                        expect(callback3).toHaveBeenCalled();
                    });

                    it("hasConnectedPreviously", function () {
                        expect(PromenadeBroker.hasConnectedPreviously()).toBeFalsy();
                        PromenadeBroker.connect();
                        expect(PromenadeBroker.hasConnectedPreviously()).toBeTruthy();
                    });

                    it("setConnectedPreviously", function () {
                        expect(PromenadeBroker.hasConnectedPreviously()).toBeFalsy();
                        PromenadeBroker.setConnectedPreviously();
                        expect(PromenadeBroker.hasConnectedPreviously()).toBeTruthy();
                    });

                    it("getLastDiscovery", function () {
                        expect(PromenadeBroker.getLastDiscovery()).toBeUndefined();
                    });

                    it("setLastDiscovery", function () {
                        PromenadeBroker.setLastDiscovery({});
                        expect(PromenadeBroker.getLastDiscovery()).toEqual({});
                    });

                    it("applySavedDiscovery", function () {
                        spyOn(PromenadeBroker, "invokeDiscoveryCallbacks");
                        PromenadeBroker.applySavedDiscovery({});
                        expect(PromenadeBroker.invokeDiscoveryCallbacks).toHaveBeenCalled();
                    });

                });

                describe("listeners", function () {

                    it("this.onMessage {'response': 'get_discovery_response'}", function () {
                        spyOn(PromenadeBroker, "invokeDiscoveryCallbacks");
                        ParlaySocket.triggerOnMessage({"response": "get_discovery_response"}, {}, {discovery: {}});
                        expect(PromenadeBroker.invokeDiscoveryCallbacks).toHaveBeenCalled();
                    });

                    it("this.onMessage {'MSG_STATUS': 'ERROR'}", function () {
                        spyOn(ParlayErrorDialog, "show");
                        ParlaySocket.triggerOnMessage({"MSG_STATUS": "ERROR"}, {}, {TOPICS: {FROM: "TEST"}, CONTENTS: {DESCRIPTION: "NONE"}});
                        expect(ParlayErrorDialog.show).toHaveBeenCalled();
                    });

                    it("this.onMessage {'MSG_STATUS': 'WARNING'}", function () {
                        spyOn(ParlayNotification, "show");
                        ParlaySocket.triggerOnMessage({"MSG_STATUS": "WARNING"}, {}, {TOPICS: {FROM: "TEST"}, CONTENTS: {DESCRIPTION: "NONE"}});
                        expect(ParlayNotification.show).toHaveBeenCalled();
                    });

                    describe("this.onDiscovery", function () {

                        it("0 protocols", function () {
                            spyOn(ParlayNotification, "show");
                            spyOn(PromenadeBroker, "setLastDiscovery");
                            ParlaySocket.triggerOnMessage({"response": "get_discovery_response"}, {}, {discovery: []});
                            expect(ParlayNotification.show).toHaveBeenCalled();
                            expect(PromenadeBroker.setLastDiscovery).toHaveBeenCalled();
                        });

                        it("1 protocol", function () {
                            spyOn(ParlayNotification, "show");
                            spyOn(PromenadeBroker, "setLastDiscovery");
                            ParlaySocket.triggerOnMessage({"response": "get_discovery_response"}, {}, {discovery: [{NAME: "TestProtocol"}]});
                            expect(ParlayNotification.show).toHaveBeenCalledWith({content: "Discovered TestProtocol."});
                            expect(PromenadeBroker.setLastDiscovery).toHaveBeenCalled();
                        });

                        it("> 1 protocol", function () {
                            spyOn(ParlayNotification, "show");
                            spyOn(PromenadeBroker, "setLastDiscovery");
                            ParlaySocket.triggerOnMessage({"response": "get_discovery_response"}, {}, {discovery: [{NAME: "TestProtocol1"}, {NAME: "TestProtocol2"}]});
                            expect(ParlayNotification.show).toHaveBeenCalledWith({content: "Discovered 2 protocols."});
                            expect(PromenadeBroker.setLastDiscovery).toHaveBeenCalled();
                        });

                    });

                    it("ParlaySocket.onOpen", function () {
                        spyOn(ParlaySocket, "sendMessage");
                        spyOn(PromenadeBroker, "setConnectedPreviously");
                        spyOn(ParlayNotification, "show");
                        spyOn(PromenadeBroker, "onMessage").and.callThrough();
                        spyOn(ParlaySettings, "get").and.callThrough();
                        spyOn(PromenadeBroker, "requestDiscovery");

                        PromenadeBroker.connect();
                        ParlaySocket.triggerOnMessage({'type': "get_protocol_discovery"}, {}, {});

                        expect(ParlaySocket.sendMessage).toHaveBeenCalledWith({"type": "subscribe"}, {"TOPICS": {"TO": 61953}});
                        expect(ParlaySocket.sendMessage).toHaveBeenCalledWith({"type": "subscribe"}, {"TOPICS": {"TO": "UI"}});
                        expect(ParlaySocket.sendMessage).toHaveBeenCalledWith({"type": "get_protocol_discovery_response"}, {"discovery": {}});
                        expect(PromenadeBroker.requestDiscovery).toHaveBeenCalled();
                        expect(PromenadeBroker.setConnectedPreviously).toHaveBeenCalled();
                        expect(ParlayNotification.show).toHaveBeenCalled();
                        expect(PromenadeBroker.onMessage).toHaveBeenCalledWith({'type': "get_protocol_discovery"}, jasmine.any(Function));
                        expect(ParlaySettings.get).toHaveBeenCalledWith("broker");
                    });

                    it("ParlaySocket.onClose", function () {
                        spyOn(ParlayNotification, "show");
                        ParlaySocket.close();
                        expect(ParlayNotification.show).toHaveBeenCalled();
                    });

                });

            });

            describe("prototypes", function () {

                describe("methods", function () {

                    it("binds ParlaySocket methods to PromenadeBroker", function () {
                        expect(PromenadeBroker.onOpen).toBe(ParlaySocket.onOpen);
                        expect(PromenadeBroker.onClose).toBe(ParlaySocket.onClose);
                        expect(PromenadeBroker.getBrokerAddress).toBe(ParlaySocket.getAddress);
                        expect(PromenadeBroker.disconnect).toBe(ParlaySocket.close);
                    });
                    
                    it("connect opens ParlaySocket", function () {
                        spyOn(ParlaySocket, "open");
                        PromenadeBroker.connect();
                        expect(ParlaySocket.open).toHaveBeenCalledWith("ws://localhost:8085");
                    });

                    it("sendMessage", function () {
                        spyOn(ParlaySocket, "sendMessage");
                        PromenadeBroker.sendMessage({}, {}, {});
                        expect(ParlaySocket.sendMessage).toHaveBeenCalledWith({type: "broker"}, {}, {type: "broker"}, jasmine.any(Function));
                    });

                    it("onMessage", function () {
                        spyOn(ParlaySocket, "onMessage");
                        PromenadeBroker.onMessage({}, function () {}, false);
                        expect(ParlaySocket.onMessage).toHaveBeenCalledWith({}, jasmine.any(Function), false);
                    });

                    it("requestShutdown", function () {
                        spyOn(PromenadeBroker, "sendMessage");
                        PromenadeBroker.requestShutdown();
                        expect(PromenadeBroker.sendMessage).toHaveBeenCalledWith({request: "shutdown"}, {}, {response: "shutdown_response"});
                    });

                    describe("requestDiscovery", function () {

                        it("while connected", function (done) {
                            spyOn(ParlayNotification, "showProgress");
                            spyOn(PromenadeBroker, "sendMessage").and.callThrough();
                            spyOn(PromenadeBroker, "requestAvailableProtocols").and.callThrough();
                            spyOn(PromenadeBroker, "requestOpenProtocols").and.callThrough();

                            PromenadeBroker.connect();
                            PromenadeBroker.requestDiscovery(true).then(function () {
                                expect(PromenadeBroker.requestAvailableProtocols).toHaveBeenCalled();
                                expect(PromenadeBroker.requestOpenProtocols).toHaveBeenCalled();
                                expect(PromenadeBroker.sendMessage).toHaveBeenCalledWith({request: "get_discovery", type: "broker"}, {"force": true, STATUS: 0}, {response: "get_discovery_response", type: "broker"});
                                done();
                            });

                            $timeout.flush();
                            expect(ParlayNotification.showProgress).toHaveBeenCalled();
                            $rootScope.$apply();

                        });

                        it("while disconnected", function () {
                            expect(PromenadeBroker.connected).toBeFalsy();
                            spyOn(ParlayNotification, "show");
                            PromenadeBroker.requestDiscovery();
                            expect(ParlayNotification.show).toHaveBeenCalledWith({content: "Cannot discover while not connected to Broker."});
                        });

                    });

                    it("openProtocol", function (done) {
                        spyOn(PromenadeBroker, "sendMessage").and.callThrough();
                        PromenadeBroker.openProtocol({name: "TestProtocol", parameters: 1}).then(function () {
                            expect(PromenadeBroker.sendMessage).toHaveBeenCalledWith({request: "open_protocol", type: "broker"}, {"protocol_name": "TestProtocol", "params": 1}, {response: "open_protocol_response", type: "broker"});
                            done();
                        });
                        $rootScope.$apply();
                    });

                    it("closeProtocol", function (done) {
                        spyOn(PromenadeBroker, "sendMessage").and.callThrough();
                        PromenadeBroker.closeProtocol("TestProtocol").then(function () {
                            expect(PromenadeBroker.sendMessage).toHaveBeenCalledWith({request: "close_protocol", type: "broker"}, {"protocol": "TestProtocol"}, {response: "close_protocol_response", type: "broker"});
                            done();
                        });
                        $rootScope.$apply();
                    });

                    it("requestAvailableProtocols", function (done) {
                        spyOn(PromenadeBroker, "sendMessage").and.callThrough();
                        PromenadeBroker.requestAvailableProtocols().then(function () {
                            expect(PromenadeBroker.sendMessage).toHaveBeenCalledWith({request: "get_protocols", type: "broker"}, {STATUS: 0}, {response: "get_protocols_response", type: "broker"});
                            done();
                        });
                        $rootScope.$apply();
                    });

                    it("requestOpenProtocols", function (done) {
                        spyOn(PromenadeBroker, "sendMessage").and.callThrough();
                        PromenadeBroker.requestOpenProtocols().then(function () {
                            expect(PromenadeBroker.sendMessage).toHaveBeenCalledWith({request: "get_open_protocols", type: "broker"}, {}, {response: "get_open_protocols_response", type: "broker"});
                            done();
                        });
                        $rootScope.$apply();
                    });

                });

            });
            
        });

    });
    
    
}());