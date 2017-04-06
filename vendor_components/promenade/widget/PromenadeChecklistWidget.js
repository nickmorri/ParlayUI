(function () {
    "use strict";

    var display_name = "Check List";
    var module_dependencies = ["parlay.data", "parlay.widget.customevent"];
    var module_name = "promenade.widget.checklist";
    var directive_name = "promenadeWidgetChecklist";
    var widget_type = "input";
    var directive_definition = promenadeWidgetChecklistJs;

    promenadeWidgetChecklistJs.$inject = ["ParlayWidgetTemplate"];
    function promenadeWidgetChecklistJs(ParlayWidgetTemplate) {

        function customLink(scope, element) {

            var checked = 0;

            scope.checkListItems = function checkListItems() {

                var listSize = scope.customizations.number.value;

                var checkList = scope.properties.list.value;
                // If a change is detected but a number is not specified do nothing and return the list
                if (listSize === null) return checkList;
                if (listSize < 0) scope.customizations.number.value = 0;


                /**
                 * Determine the amount of elements needed to add to the checkList and push them on the checkList.list array.
                 * Number needed to add is calculated by the input arg, "listSize" subtracted by the length of checkList.length
                 */
                for (var i = 0; i < listSize - checkList.length; ++i) {
                    checkList.push({
                        value: "",
                        isChecked: false
                    });
                }

                /**
                 * If any the checkList size becomes a smaller number less than the previous configuration, remove the
                 * last elements that are extending past the maximum list size
                 */
                for (i = 0; i < checkList.length - listSize; ++i) {
                    var poppedItem = checkList.pop();
                    if (poppedItem.isChecked)
                        --checked;
                }

                return checkList;
            };

            /**
             * Function to process the checking of a single checkbox
             */
            scope.checkBox = function checkBox(item, index) {
                checked += (item.isChecked) ? -1 : 1;
                var listLength = scope.properties.list.value.length;
                scope.properties.toggle.value = checked === listLength && listLength !== 0;
            };

            /**
             * Function handler to process checking every box in the list
             */
            scope.checkAll = function checkAll() {
                for (var i = 0; i < scope.properties.list.value.length; ++i) {
                    scope.properties.list.value[i].isChecked = scope.properties.toggle.value;
                }
                checked = scope.properties.toggle.value ? scope.properties.list.value.length : 0;
            };

            /**
             * function handler to process a change in the toggle value
             */
            scope.$watch("properties.toggle.value", function (newVal, oldVal) {
                if (oldVal !== newVal) {
                    if (!(newVal === true && scope.properties.list.value.length === checked) &&
                        !(newVal === false && scope.properties.list.value.length - 1 === checked))
                        scope.checkAll();
                }
            });

        }

        return new ParlayWidgetTemplate({
            title: "Check List",
            templateUrl: "../vendor_components/promenade/widget/directives/promenade-widget-checklist.html",
            customLink: customLink,
            customizationDefaults: {
                number: {
                    property_name: "Check List Size",
                    value: 5,
                    type: "number"
                }
            },
            properties: {
                list: {
                    default: []
                },
                toggle: {
                    default: false
                }
            }
        }, display_name);
    }

    var property_helper = "# Example script for the check list widget\nfrom parlay.utils import *\nfrom parlay import widgets\n" +
        "setup()\n\n# Setting the value of the nth item (zero based indexing) in the checklist\n" +
        "widgets[{name}].list[n].value = \"new value\"\n\n# Getting the value of the nth item in the checklist:\n" +
        "retrieved_value = widgets[{name}].list[n].value\n\n# Checking the nth item in the checklist:\n" +
        "widgets[{name}].list[n].isChecked = True # Set to False to uncheck\n\n# Checking all items in the checklist\n" +
        "widgets[{name}].toggle = True # Set to False to uncheck all\n";

    var local_data_helper = "# To access the checked box's data on a captured event, use the variable local_data\n" +
            "# Access the value of the data: local_data[\"value\"]\n# Check to see if the data was checked(True) or unchecked(False)" +
            ": local_data[\"isChecked\"]\n";

    var api_helper = {
        property: property_helper,
        local_data: local_data_helper
    };

    widgetRegistration(display_name, module_name, module_dependencies, directive_name, widget_type, directive_definition, [], api_helper);
}());