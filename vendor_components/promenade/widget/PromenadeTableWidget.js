(function () {
    "use strict";

    var display_name = "Table";
    var module_dependencies = ["parlay.data", "parlay.widget.manager"];
    var module_name = "promenade.widget.table";
    var directive_name = "promenadeWidgetTable";
    var widget_type = "multi";
    var directive_definition = promenadeWidgetTableJs;

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

                    for (j = 0; j < colsToSub; ++j)
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
                    value: 3,
                    type: "number"
                },
                columns: {
                    property_name: "Table Columns",
                    value: 3,
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

    var property_helper = "# Example script for the table widget\nfrom parlay.utils import *\nfrom parlay import widgets\n" +
        "setup()\n\n# Setting the value of the Nth Header Column (zero based indexing) in the table\n" +
        "widgets[{name}].headers[n] = \"new value\"\n\n# Getting the value of the Nth header column:\n" +
        "retrieved_value = widgets[{name}].headers[n]\n\n# Setting the value of the item at Row x and Column y\n" +
        "widgets[{name}].data[x][y] = \"new value\"\n\n# Getting the value of the item ar Row x and Column y:\n" +
        "retrieved_value = widgets[{name}].data[x][y]\n";

    var api_helper = {
        property: property_helper
    };

    widgetRegistration(display_name, module_name, module_dependencies, directive_name, widget_type, directive_definition, [], api_helper);
}());