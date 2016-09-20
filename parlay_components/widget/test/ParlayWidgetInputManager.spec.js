(function () {
    "use strict";
    
    describe("parlay.widget.inputmanager", function () {
        
        beforeEach(module("parlay.widget.inputmanager"));
        
        describe("ParlayWidgetInputManager", function () {
            var scope, $compile, ParlayWidgetInputManager;
            
            beforeEach(inject(function (_$rootScope_, _$compile_, _ParlayWidgetInputManager_) {
                scope = _$rootScope_.$new();
                scope.uid = 0;
                $compile = _$compile_;
                ParlayWidgetInputManager = _ParlayWidgetInputManager_;
            }));

            it("constructs", function () {
                expect(ParlayWidgetInputManager.widgets).toEqual({});
            });

            it("registers element", function () {

                expect(ParlayWidgetInputManager.widgets).toEqual({});

                scope.widgetName = "testWidget";
                scope.info = {uid:0};
                scope.elementName = "test";
                var element = $compile("<input name='test'  />")(scope);
                scope.events = '["click"]';

                ParlayWidgetInputManager.registerElement(
                    scope.info, element[0], scope, JSON.parse(scope.events)
                );

                expect(ParlayWidgetInputManager.widgets).toEqual({
                    0: [ //list of widgets with that UID (should be just one)
                        {
                            element_ref: element[0],
                            uid: 0,
                            events: {
                                click: {
                                    event: 'click',
                                    addListener: jasmine.any(Function),
                                    removeListener: jasmine.any(Function),
                                    clearAllListeners: jasmine.any(Function),
                                    handler: null
                                }
                            }
                        }
                    ]
                });

                scope.$destroy();

                expect(ParlayWidgetInputManager.widgets).toEqual({});

            });

            it("registerHandler", function () {

                expect(ParlayWidgetInputManager.widgets).toEqual({});

                scope.widgetName = "testWidget";
                scope.info = {uid:0};
                scope.elementName = "test";
                var element = $compile("<input name='test'/>")(scope);
                scope.events = '["click"]';


                ParlayWidgetInputManager.registerElement(
                    scope.info, element[0], scope, JSON.parse(scope.events)
                );

                expect(ParlayWidgetInputManager.widgets[0][0].events.click.handler).toBe(null);

                ParlayWidgetInputManager.registerHandler(ParlayWidgetInputManager.widgets[0][0].events.click);

                expect(ParlayWidgetInputManager.widgets[0][0].events.click.handler).not.toBe(null);

            });

            it("deregisterHandler", function () {

                expect(ParlayWidgetInputManager.widgets).toEqual({});

                scope.widgetName = "testWidget";
                scope.info = {uid:0};
                scope.elementName = "test";
                var element = $compile("<input name='test'/>")(scope);
                scope.events = '["click"]';


                ParlayWidgetInputManager.registerElement(
                    scope.info, element[0], scope, JSON.parse(scope.events)
                );

                expect(ParlayWidgetInputManager.widgets[0][0].events.click.handler).toBe(null);

                ParlayWidgetInputManager.registerHandler(ParlayWidgetInputManager.widgets[0][0].events.click);

                expect(ParlayWidgetInputManager.widgets[0][0].events.click.handler).not.toBe(null);

                ParlayWidgetInputManager.deregisterHandler(ParlayWidgetInputManager.widgets[0][0].events.click);

                expect(ParlayWidgetInputManager.widgets[0][0].events.click.handler).toBe(null);
            });

            it("getElements", function () {

                expect(ParlayWidgetInputManager.getElements()).toEqual([]);

                var testWidget1Element = $compile("<input name='test'/>")(scope);

                ParlayWidgetInputManager.registerElement(
                    {uid:0}, testWidget1Element[0], scope, ["click"]
                );

                var testWidget2Element = $compile("<input name='test'/>")(scope);

                ParlayWidgetInputManager.registerElement(
                    {uid:1}, testWidget2Element[0], scope, ["click"]
                );

                expect(ParlayWidgetInputManager.getElements()).toEqual([
                    {
                        element_ref: testWidget1Element[0],

                        uid: 0,
                        events: {
                            click: {
                                event: 'click',
                                addListener: jasmine.any(Function),
                                removeListener: jasmine.any(Function),
                                clearAllListeners: jasmine.any(Function),
                                handler: null
                            }
                        }
                    },
                    {
                        element_ref: testWidget2Element[0],
                        uid: 1,
                        events: {
                            click: {
                                event: 'click',
                                addListener: jasmine.any(Function),
                                removeListener: jasmine.any(Function),
                                clearAllListeners: jasmine.any(Function),
                                handler: null
                            }
                        }
                    }
                ]);
            });

            it("getEvents", function () {

                expect(ParlayWidgetInputManager.getEvents()).toEqual([]);

                var testWidget1Element = $compile("<input name='test'/>")(scope);
                //scope.info, element[0], scope, JSON.parse(events)
                ParlayWidgetInputManager.registerElement(
                    {uid:0}, testWidget1Element[0], scope, ["click"]
                );

                var testWidget2Element = $compile("<input name='test'/>")(scope);

                ParlayWidgetInputManager.registerElement(
                    {uid:1}, testWidget2Element[0], scope, ["click"]
                );

                expect(ParlayWidgetInputManager.getEvents()).toEqual([
                    {
                        event: 'click',
                        addListener: jasmine.any(Function),
                        removeListener: jasmine.any(Function),
                        clearAllListeners: jasmine.any(Function),
                        handler: null,
                        element: {
                          uid:0
                        }
                    },
                    {
                        event: 'click',
                        addListener: jasmine.any(Function),
                        removeListener: jasmine.any(Function),
                        clearAllListeners: jasmine.any(Function),
                        handler: null,
                        element: {
                            uid:1
                        }
                    }
                ]);

            });
            
        });
        
    });
    
}());