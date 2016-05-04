(function () {
    "use strict";

    var customLink;

    describe("promenade.widget.template", function() {

        BasicTemplateDirective.$inject = ["ParlayWidgetTemplate"];
        function BasicTemplateDirective (ParlayWidgetTemplate) {
            return new ParlayWidgetTemplate({
                template: "<span></span>"
            });
        }

        ElementRegistrationDirective.$inject = ["ParlayWidgetTemplate"];
        function ElementRegistrationDirective (ParlayWidgetTemplate) {
            return new ParlayWidgetTemplate({
                template: "<button></button>",
                eventRegistration: {
                    directive_name: "elementRegistration",
                    parent_tag: "md-card-content",
                    target_tag: "button",
                    events: ["click"]
                }
            });
        }

        UserDefinedLinkDirective.$inject = ["ParlayWidgetTemplate"];
        function UserDefinedLinkDirective (ParlayWidgetTemplate) {
            return new ParlayWidgetTemplate({
                template: "<span></span>",
                customLink: customLink
            });
        }

        UserDefinedLinkWithElementRegistrationDirective.$inject = ["ParlayWidgetTemplate"];
        function UserDefinedLinkWithElementRegistrationDirective (ParlayWidgetTemplate) {
            return new ParlayWidgetTemplate({
                template: "<button></button>",
                customLink: customLink,
                eventRegistration: {
                    directive_name: "elementRegistration",
                    parent_tag: "md-card-content",
                    target_tag: "button",
                    events: ["click"]
                }
            });
        }

        angular.module("sampleDirectives", ["promenade.widget.template"])
            .directive("basicTemplate", BasicTemplateDirective)
            .directive("elementRegistration", ElementRegistrationDirective)
            .directive("userDefinedLink", UserDefinedLinkDirective)
            .directive("userDefinedLinkWithElementRegistration", UserDefinedLinkWithElementRegistrationDirective);

        beforeEach(module("promenade.widget.template"));
        beforeEach(module("sampleDirectives"));

        describe("ParlayWidgetTemplate", function () {
            var ParlayWidgetTemplate;

            beforeEach(inject(function(_ParlayWidgetTemplate_) {
                ParlayWidgetTemplate = _ParlayWidgetTemplate_;
            }));

            describe("constructs", function () {

                it("basic template only directive", function () {

                    var directive_definition = new ParlayWidgetTemplate({
                        templateUrl: "fake/path/to/directive.html"
                    });

                    expect(directive_definition).toEqual({
                        restrict: "E",
                        link: jasmine.any(Function),
                        scope: {
                            items: "=",
                            transformedValue: "=",
                            widgetsCtrl: "=",
                            edit: "=",
                            uid: "="
                        },
                        templateUrl: "fake/path/to/directive.html"
                    });

                });

                it("element (event) registration directive", function () {

                    var directive_definition = new ParlayWidgetTemplate({
                        templateUrl: "fake/path/to/directive.html",
                        eventRegistration: {
                            directive_name: "testWidget",
                            parent_tag: "md-card-content",
                            target_tag: "button",
                            events: ["click"]
                        }
                    });

                    expect(directive_definition).toEqual({
                        restrict: "E",
                        link: jasmine.any(Function),
                        scope: {
                            items: "=",
                            transformedValue: "=",
                            widgetsCtrl: "=",
                            edit: "=",
                            uid: "="
                        },
                        templateUrl: "fake/path/to/directive.html"
                    });

                });

                it("custom user-defined link directive", function () {

                    function customLink() {
                        // Statements would be here.
                    }

                    var directive_definition = new ParlayWidgetTemplate({
                        templateUrl: "fake/path/to/directive.html",
                        link: customLink
                    });

                    expect(directive_definition).toEqual({
                        restrict: "E",
                        link: customLink,
                        scope: {
                            items: "=",
                            transformedValue: "=",
                            widgetsCtrl: "=",
                            edit: "=",
                            uid: "="
                        },
                        templateUrl: "fake/path/to/directive.html"
                    });

                });

                it("element (event) registration + custom user-defined link directive", function () {

                    function customLink() {
                        // Statements would be here.
                    }

                    var directive_definition = new ParlayWidgetTemplate({
                        templateUrl: "fake/path/to/directive.html",
                        eventRegistration: {
                            directive_name: "testWidget",
                            parent_tag: "md-card-content",
                            target_tag: "button",
                            events: ["click"]
                        },
                        link: customLink
                    });

                    expect(directive_definition).toEqual({
                        restrict: "E",
                        link: customLink,
                        scope: {
                            items: "=",
                            transformedValue: "=",
                            widgetsCtrl: "=",
                            edit: "=",
                            uid: "="
                        },
                        templateUrl: "fake/path/to/directive.html"
                    });

                });

            });

            describe("compiles", function () {
                var $compile, $rootScope, ParlayWidgetInputManager;

                beforeEach(inject(function (_$compile_, _$rootScope_, _ParlayWidgetInputManager_) {
                    $compile = _$compile_;
                    $rootScope = _$rootScope_;
                    ParlayWidgetInputManager = _ParlayWidgetInputManager_;
                }));

                it("basic template only directive", function (done) {

                    var would_be_base_widget_scope = $rootScope.$new();

                    would_be_base_widget_scope.$on("parlayWidgetLoaded", done);

                    $compile("<basic-template></basic-template>")(would_be_base_widget_scope);
                    would_be_base_widget_scope.$digest();

                });

                it("element (event) registration directive", function (done) {
                    spyOn(ParlayWidgetInputManager, "registerElements").and.returnValue("elementRegistration");

                    var would_be_base_widget_scope = $rootScope.$new();

                    would_be_base_widget_scope.$on("parlayWidgetLoaded", function () {
                        expect(ParlayWidgetInputManager.registerElements).toHaveBeenCalled();
                        done();
                    });

                    $compile("<element-registration></element-registration>")(would_be_base_widget_scope);
                    would_be_base_widget_scope.$digest();

                });

                it("custom user-defined link directive", function (done) {

                    customLink = jasmine.createSpy("spy");

                    var would_be_base_widget_scope = $rootScope.$new();

                    would_be_base_widget_scope.$on("parlayWidgetLoaded", function () {
                        expect(customLink).toHaveBeenCalled();
                        done();
                    });

                    $compile("<user-defined-link></user-defined-link>")(would_be_base_widget_scope);
                    would_be_base_widget_scope.$digest();

                });

                it("element (event) registration + custom user-defined link directive", function (done) {

                    spyOn(ParlayWidgetInputManager, "registerElements").and.returnValue("elementRegistration");

                    customLink = jasmine.createSpy("spy");

                    var would_be_base_widget_scope = $rootScope.$new();

                    would_be_base_widget_scope.$on("parlayWidgetLoaded", function () {
                        expect(ParlayWidgetInputManager.registerElements).toHaveBeenCalled();
                        expect(customLink).toHaveBeenCalled();
                        done();
                    });

                    $compile("<user-defined-link-with-element-registration></user-defined-link-with-element-registration>")(would_be_base_widget_scope);
                    would_be_base_widget_scope.$digest();

                });

            });

        });

    });

}());