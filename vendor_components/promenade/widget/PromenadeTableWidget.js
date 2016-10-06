(function () {
    "use strict";

    var display_name = "Table";
    var module_dependencies = ["parlay.data"];
    var module_name = "promenade.widget.table";
    var directive_name = "promenadeWidgetTable";
    var wigdet_type = "input";
    var directive_definition = promenadeWidgetTableJs;

    widgetRegistration(display_name, module_name, module_dependencies, directive_name, wigdet_type, directive_definition, []);

    promenadeWidgetTableJs.$inject = ["ParlayWidgetTemplate"];
    function promenadeWidgetTableJs(ParlayWidgetTemplate) {

        function customLink(scope) {

            var headers = scope.customizations.headers.value;
            var data = scope.customizations.data.value;

            scope.headerItems = function headerItems(col) {

                if (col === null || col === 0)
                    return headers;

                for (var i = 0; i < col - headers.length; ++i) {
                    headers.push({
                        value: "", 
                        index: headers.length
                    });
                }

                for (var j = 0; j < headers.length - col; ++j)
                    headers.pop();

                return headers;
            };


            scope.tableData = function tableData(row, col) {
                // console.log("row = " + row + " col = " + col);

                if (row === null || row === 0 || col === null || col === 0)
                    return data;

                if (row < 1) scope.customizations.rows.value = 1;
                if (col < 1) scope.customizations.columns.value = 1;



                /* add/subtract rows from table */
                var rowsToAdd = row - data.length;
                var rowsToSub = data.length - row;

                for (var x = 0; x < rowsToAdd; ++x) {
                    console.log("Adding row");
                    data.push([]);
                    for (var y = 0; y < col; ++y) {
                        data[data.length - 1].push({
                            value: "",
                            index: data[data.length - 1].length
                        });
                    }
                }

                for (var z = 0; z < rowsToSub; ++z) {
                    console.log("removing rows");
                    data.pop();
                }


                /* add/subtract columns to every row */
                for (var i = 0; i < data.length; ++i) {
                    var colsToAdd = col - data[i].length;
                    var colsToSub = data[i].length - col;

                    for (var j = 0; j < colsToAdd; ++j) {
                        console.log("adding columns");
                        data[i].push({
                            value: "",
                            index: data[i].length
                        });
                    }

                    for (var k = 0; k < colsToSub; ++k) {
                        console.log("removing columns");
                        data[i].pop();
                    }
                }

                return data;
            };
        }

        return new ParlayWidgetTemplate({
            title: "Check List",
            templateUrl: "../vendor_components/promenade/widget/directives/promenade-widget-table.html",
            customizationDefaults: {
                rows: {
                    property_name: "Table Rows",
                    value: 1,
                    type: "number"
                },
                columns: {
                    property_name: "Table Columns",
                    value: 1,
                    type: "number"
                },
                headers: {
                    hidden: true,
                    value: []
                },
                data: {
                    hidden: true,
                    value: [] // should be 2D array
                }
            },
            customLink: customLink
        }, display_name);
    }
}());