(function () {
    "use strict";

    var display_name = "Check List";
    var module_dependencies = ["parlay.data"];
    var module_name = "promenade.widget.checklist";
    var directive_name = "promenadeWidgetChecklist";
    var wigdet_type = "input";
    var directive_definition = promenadeWidgetChecklistJs;

    widgetRegistration(display_name, module_name, module_dependencies, directive_name, wigdet_type, directive_definition, []);


    promenadeWidgetChecklistJs.$inject = ["ParlayWidgetTemplate"];
    function promenadeWidgetChecklistJs(ParlayWidgetTemplate) {

        function customLink(scope) {

            scope.checkListItems = function checkListItems(listSize) {

                var checkList = scope.properties.list.value;
                var checked = scope.properties.checked.value;
                /**
                 * If a change is detected but a number is not specified
                 * do nothing and return the list
                 */
                if (listSize === null) return checkList;
                if (listSize < 0) scope.customizations.number.value = 0;


                /**
                 * Determine the amount of elements needed to add to the
                 * checkList and push them on the checkList.list array.
                 * Number needed to add is calculated by the input arg,
                 * "listSize" subtracted by the length of checkList.list.length
                 */
                for (var i = 0; i < listSize - checkList.length; ++i) {
                    checkList.push({
                        value: "", 
                        isChecked: false, 
                        index: checkList.length
                    });
                }

                /**
                 * If any the checkList size becomes a smaller number
                 * less than the previous configuration, remove the
                 * last elements that are extending past the maximum
                 * list size
                 */
                for (i = 0; i < checkList.length - listSize; ++i) {
                    var poppedItem = checkList.pop();
                    if (poppedItem.isChecked)
                        --scope.properties.checked.value;
                }

                /* reset the checkAll toggle if a change is detected */
                var listLength = checkList.length;
                scope.properties.toggle.value = checked === listLength && listLength !== 0;

                return checkList;
            };

            /**

             */
            scope.checkBox = function checkBox(item) {
                var checkList = scope.properties.list.value;
                var checked = scope.properties.checked.value;

                scope.properties.checked.value += (item.isChecked) ? -1 : 1;
                scope.properties.toggle.value = checked === checkList.length;
            };

            scope.checkAll = function checkAll() {

                var checkList = scope.properties.list.value;
                var checked = scope.properties.checked.value;
                var toggle = scope.properties.toggle.value;

                for (var i = 0; i < checkList.length; ++i)
                    checkList[i].isChecked = !toggle;

                scope.properties.checked.value = (checked === checkList.length) ? 0 : checkList.length;
            };

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
                checked: {
                    default: 0
                },
                list: {
                    default: []
                },
                toggle: {
                    default: false
                }
            }
        }, display_name);
    }
}());