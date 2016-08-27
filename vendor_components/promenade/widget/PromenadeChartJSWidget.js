(function () {
    "use strict";
    var display_name = "ChartJS";
    var module_dependencies = ["parlay.widget.template", "parlay.utility"];
    var module_name = "promenade.widget.chartjs";
    var directive_name = "promenadeWidgetChartJs";
    var widget_type = "display";
    var directive_function = PromenadeWidgetChartJs;

    widgetRegistration(display_name, module_name, module_dependencies, directive_name, widget_type, directive_function, []);

    Chart.defaults.global.elements.point.radius = 10;
    Chart.defaults.global.elements.point.hoverRadius = 30;

    PromenadeWidgetChartJs.$inject = ["ParlayWidgetTemplate", "$interval", "RandColor"];
    function PromenadeWidgetChartJs (ParlayWidgetTemplate, $interval, RandColor) {

        function customLink (scope, element, attrs, controller, transcludeFn) {

            var chart, chart_interval, canvas_context;

            //scope.customizations.poll_rate = {'value': 1};
            //scope.customizations.poll_rate.value = 1; //this will be given by the customization tab but hasn't been set yet


            canvas_context = element.find("canvas")[0].getContext("2d");

            scope.paused = false;

            scope.togglePause = function () {
                scope.paused = !scope.paused;
            };

            function values(items) {
                return items.map(function (container) {
                    return {name: container.item_name, value: container.value};
                }).concat([{name: "transformed_value", value: scope.transformedValue}]);
            }

            //construct or re-construct the graph based on the items attached
            var construct = function (newValue, custom_config) {

                var randColor = new RandColor();
                if(custom_config === undefined)
                {
                    chart = new Chart(canvas_context, {
                        type: "line",
                        options: {
                            stacked: true,
                            xAxes: [{display: false}]
                        },
                        data: {
                            labels: [""],
                            datasets: values(newValue).map(function (container) {
                                return {label: container.name, data: [], backgroundColor: randColor.pop().hex()};
                            })//.concat([{label: "transformed_value", data: [], backgroundColor: randColor.pop().hex()}])
                        }
                    });
                }
                else {
                    //we're not auto configing so make sure that's false
                    scope.customizations.auto_config.value = false;
                    chart = new Chart(canvas_context, custom_config); //build with the custom config object
                }

            };
            //initial construction
            construct([]);
            //watch the items and reconstruct on additon/subtraction
            // return a deregistration function that when called will stop this monitoring.
            var items_deregistration = scope.$watchCollection("items", function(newValue) {construct(newValue,
                scope.properties.custom_config.value)});

            chart_interval = 1000.0 / scope.customizations.poll_rate.value;
            //this does the actual update
            var update_chart = function () {
                //don't push data if we're not using aut_config
                if(!scope.customizations.auto_config.value) return;
                var items = values(scope.items);

                if (!!items && items.length > 0) {
                    items.forEach(function (item) {

                        var data = chart.data.datasets.find(function (dataset) {
                            return dataset.label == item.name;
                        }).data;
                        //don't push data if we don't have any (or if it isnt a number)
                        if(item.value !== undefined && !isNaN(item.value)) data.push(item.value);

                        if (data.length > 20) {
                            data.shift();
                        }

                    });

                    chart.data.labels.push("");

                    if (chart.data.labels.length > 20) {
                        chart.data.labels.shift();
                    }
                }
                //if we're not paused, and we actually have something to graph, then update the graph
                if (!scope.paused) {
                    chart.update();
                }

            };
            //do it every chart_interval seconds
            var interval_promise = $interval(update_chart, chart_interval);
            //watch the poll_rate and change accordingly
            scope.$watch('customizations.poll_rate.value', function(newValue){
                $interval.cancel(interval_promise);
                chart_interval = 1000.0/newValue;
                interval_promise = $interval(update_chart, chart_interval); //re calc the interval

            });

            //watch the custom_config property and apply it if it's set
            scope.$watch('properties.custom_config.value', function(newValue){
               construct(undefined, newValue); // construct the chart with the custom config
            });

            scope.$on("$destroy", function () {
                $interval.cancel(interval_promise);
                items_deregistration();
            });

        }

        return new ParlayWidgetTemplate({
            title: "ChartJS",
            templateUrl: "../vendor_components/promenade/widget/directives/promenade-widget-chart-canvas.html",
            customLink: customLink,
            customizationDefaults: {
                auto_config: {
                    property_name: "Automatically Config",
                    type: "checkbox",
                    value: true
                },
                poll_rate: {
                    property_name: "Poll Rate (Hz)",
                    type: "text",
                    value: 2
                }
            },
            properties:
            {
                //config options to manually config
                custom_config: {
                    default: undefined
                }
            }
        });
    }

}());