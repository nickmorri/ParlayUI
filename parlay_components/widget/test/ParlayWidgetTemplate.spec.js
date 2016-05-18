(function () {
    "use strict";

    var customLink;

    describe("parlay.widget.template", function() {

        BasicTemplateDirective.$inject = ["ParlayWidgetTemplate"];
        function BasicTemplateDirective (ParlayWidgetTemplate) {
            return new ParlayWidgetTemplate({
                template: "<span></span>"
            });
        }

        UserDefinedLinkDirective.$inject = ["ParlayWidgetTemplate"];
        function UserDefinedLinkDirective (ParlayWidgetTemplate) {
            return new ParlayWidgetTemplate({
                template: "<span></span>",
                customLink: customLink
            });
        }

        angular.module("sampleDirectives", ["parlay.widget.template"])
            .directive("basicTemplate", BasicTemplateDirective)
            .directive("userDefinedLink", UserDefinedLinkDirective);

        beforeEach(module("parlay.widget.template"));
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
                            uid: "=",
                            template: "=",
                            options: "="
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
                            uid: "=",
                            template: "=",
                            options: "="
                        },
                        templateUrl: "fake/path/to/directive.html"
                    });

                });

            });

            describe("compiles", function () {
                var $compile, $rootScope;

                beforeEach(inject(function (_$compile_, _$rootScope_) {
                    $compile = _$compile_;
                    $rootScope = _$rootScope_;
                }));

                it("basic template only directive", function (done) {

                    var would_be_base_widget_scope = $rootScope.$new();

                    would_be_base_widget_scope.$on("parlayWidgetTemplateLoaded", done);

                    $compile("<basic-template></basic-template>")(would_be_base_widget_scope);
                    would_be_base_widget_scope.$digest();

                });

                it("custom user-defined link directive", function (done) {

                    customLink = jasmine.createSpy("spy");

                    var would_be_base_widget_scope = $rootScope.$new();

                    would_be_base_widget_scope.$on("parlayWidgetTemplateLoaded", function () {
                        expect(customLink).toHaveBeenCalled();
                        done();
                    });

                    $compile("<user-defined-link></user-defined-link>")(would_be_base_widget_scope);
                    would_be_base_widget_scope.$digest();

                });

            });

        });

    });

}());