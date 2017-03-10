(function () {
    "use strict";

    var display_name = "Table";
    var module_dependencies = ["parlay.data", "parlay.widget.manager"];
    var module_name = "promenade.widget.table";
    var directive_name = "promenadeWidgetTable";
    var wigdet_type = "input";
    var directive_definition = promenadeWidgetTableJs;

    widgetRegistration(display_name, module_name, module_dependencies, directive_name, wigdet_type, directive_definition, []);

    promenadeWidgetTableJs.$inject = ["ParlayWidgetTemplate", "ParlayWidgetManager"];
    function promenadeWidgetTableJs(ParlayWidgetTemplate, ParlayWidgetManager) {

        function customLink(scope) {

            scope.pwm = ParlayWidgetManager; // reference to parlay widget manager to enable/disabled editing

            scope.$watch("customizations.columns.value", function(newVal) {
                if (newVal === null || newVal === 0) return;
                if (newVal < 1) scope.customizatons.columns.value = 0;

                var headers = scope.properties.headers.value;
                var data = scope.properties.data.value;

                var headersToAdd = newVal - headers.length;
                var headersToSub = headers.length - newVal;

                // Add the appropriate amount of columns to the header portion
                // of the table
                for (var i = 0; i < headersToAdd; ++i)
                    headers.push("");

                // Remove the appropriate amount of columns to the header
                // portion of the table
                for (var j = 0; j < headersToSub; ++j)
                    headers.pop();

                // add/subtract columns to every row
                for (i = 0; i < data.length; ++i) {
                    var colsToAdd = newVal - data[i].length;
                    var colsToSub = data[i].length - newVal;

                    for (j = 0; j < colsToAdd; ++j)
                        data[i].push("");

                    for (j = 0; j < colsToSub; ++k)
                        data[i].pop();
                }
            });

            scope.$watch("customizations.rows.value", function(newVal) {

                if (newVal === null || newVal === 0) return;
                if (newVal < 1) scope.customizations.rows.value = 1;

                var data = scope.properties.data.value;

                // add/subtract rows from table
                var rowsToAdd = newVal - data.length;
                var rowsToSub = data.length - newVal;

                // Add rows with empty columns to the data table
                for (var x = 0; x < rowsToAdd; ++x) {
                    data.push([]);
                    for (var y = 0; y < scope.customizations.columns.value; ++y) {
                        data[data.length - 1].push("");
                    }
                }

                // remove rows from the data table that are no longer needed
                for (var z = 0; z < rowsToSub; ++z)
                    data.pop();
            });
        }

        return new ParlayWidgetTemplate({
            title: "Check List",
            templateUrl: "../vendor_components/promenade/widget/directives/promenade-widget-table.html",
            customLink: customLink,
            customizationDefaults: {
                rows: {
                    property_name: "Table Rows",
                    value: 5,
                    type: "number"
                },
                columns: {
                    property_name: "Table Columns",
                    value: 5,
                    type: "number"
                }
            },
            properties: {
                data: {
                    default: [] // should be a 2d array
                },
                headers: {
                    default: []
                }
            }
        }, display_name);
    }
}());