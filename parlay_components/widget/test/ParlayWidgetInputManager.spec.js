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

            it("registerElements", function () {

                expect(ParlayWidgetInputManager.widgets).toEqual({});

                var widgetName = "testWidget";
                var rootElement = $compile("<div><span><input name='test'/></span></div>")(scope);
                var parentTag = "span";
                var targetTag = "input";
                var events = ["click"];

                expect(ParlayWidgetInputManager.registerElements(
                    widgetName, rootElement, parentTag, targetTag, scope, events
                )).toEqual(jasmine.objectContaining({
                    parent_tag_name: widgetName + scope.uid,
                    elements: [{
                        rootElement: rootElement,
                        name: 'testWidget0_test',
                        type: 'input',
                        element: jasmine.any(Object),
                        events: {
                            click: {
                                event: 'click',
                                addListener: jasmine.any(Function),
                                removeListener: jasmine.any(Function),
                                clearAllListeners: jasmine.any(Function),
                                handler: null
                            }
                        }
                    }]
                }));

                expect(ParlayWidgetInputManager.widgets).toEqual({
                    testWidget0: [
                        {
                            rootElement: rootElement,
                            name: 'testWidget0_test',
                            type: 'input',
                            element: jasmine.any(Object),
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

                var widgetName = "testWidget";
                var rootElement = $compile("<div><span><input name='test'/></span></div>")(scope);
                var parentTag = "span";
                var targetTag = "input";
                var events = ["click"];

                var click_event = ParlayWidgetInputManager.registerElements(
                    widgetName, rootElement, parentTag, targetTag, scope, events
                ).elements[0].events.click;

                expect(click_event.handler).toBe(null);

                ParlayWidgetInputManager.registerHandler(click_event);

                expect(click_event.handler).not.toBe(null);

            });

            it("deregisterHandler", function () {

                expect(ParlayWidgetInputManager.widgets).toEqual({});

                var widgetName = "testWidget";
                var rootElement = $compile("<div><span><input name='test'/></span></div>")(scope);
                var parentTag = "span";
                var targetTag = "input";
                var events = ["click"];

                var click_event = ParlayWidgetInputManager.registerElements(
                    widgetName, rootElement, parentTag, targetTag, scope, events
                ).elements[0].events.click;

                expect(click_event.handler).toBe(null);

                ParlayWidgetInputManager.registerHandler(click_event);

                expect(click_event.handler).not.toBe(null);

                ParlayWidgetInputManager.deregisterHandler(click_event);

                expect(click_event.handler).toBe(null);
            });

            it("getElements", function () {

                expect(ParlayWidgetInputManager.getElements()).toEqual([]);

                var testWidget1RootElement = $compile("<div><span><input name='test'/></span></div>")(scope);

                ParlayWidgetInputManager.registerElements(
                    "testWidget1",
                    testWidget1RootElement,
                    "span",
                    "input",
                    scope,
                    ["click"]
                );

                var testWidget2RootElement = $compile("<div><span><input name='test'/></span></div>")(scope);

                ParlayWidgetInputManager.registerElements(
                    "testWidget2",
                    testWidget2RootElement,
                    "span",
                    "input",
                    scope,
                    ["click"]
                );

                expect(ParlayWidgetInputManager.getElements()).toEqual([
                    {
                        rootElement: testWidget1RootElement,
                        name: 'testWidget10_test',
                        type: 'input',
                        element: jasmine.any(Object),
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
                        rootElement: testWidget2RootElement,
                        name: 'testWidget20_test',
                        type: 'input',
                        element: jasmine.any(Object),
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

                var testWidget1RootElement = $compile("<div><span><input name='test'/></span></div>")(scope);

                ParlayWidgetInputManager.registerElements(
                    "testWidget1",
                    testWidget1RootElement,
                    "span",
                    "input",
                    scope,
                    ["click"]
                );

                var testWidget2RootElement = $compile("<div><span><input name='test'/></span></div>")(scope);

                ParlayWidgetInputManager.registerElements(
                    "testWidget2",
                    testWidget2RootElement,
                    "span",
                    "input",
                    scope,
                    ["click"]
                );

                expect(ParlayWidgetInputManager.getEvents()).toEqual([
                    {
                        event: 'click',
                        addListener: jasmine.any(Function),
                        removeListener: jasmine.any(Function),
                        clearAllListeners: jasmine.any(Function),
                        handler: null,
                        element: 'testWidget10_test'
                    },
                    {
                        event: 'click',
                        addListener: jasmine.any(Function),
                        removeListener: jasmine.any(Function),
                        clearAllListeners: jasmine.any(Function),
                        handler: null,
                        element: 'testWidget20_test'
                    }
                ]);

            });
            
        });
        
    });
    
}());