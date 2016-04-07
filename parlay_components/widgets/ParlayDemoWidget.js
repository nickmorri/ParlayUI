function ParlayDemoWidget() {
    return {
        templateUrl: "../parlay_components/widgets/directives/parlay-demo-widget.html",
        require: "^parlayBaseWidget",
        link: function (scope, element, attributes, controller) {
            Array.prototype.slice.call(element.find("input")).forEach(controller.registerInput);

            this.smoothie = new SmoothieChart({
                grid: {
                    strokeStyle:'rgb(125, 0, 0)',
                    fillStyle:'rgb(60, 0, 0)',
                    lineWidth: 1,
                    millisPerLine: 250,
                    verticalSections: 6
                },
                labels: {
                    fillStyle:'rgb(60, 0, 0)'
                }
            });

            this.smoothie.streamTo(element.find("canvas")[0], 1000);

            var line = new TimeSeries();
            this.smoothie.addTimeSeries(line);

            scope.$watch("transformedValue", function (newValue) {
                if (!!newValue) {
                    line.append(new Date().getTime(), newValue);
                }
            });

        }
    };
}

angular.module("parlay.widgets.demo", ["parlay.widgets.base"])
    .directive("parlayDemoWidget", [ParlayDemoWidget]);