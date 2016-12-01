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

            var checkList = scope.customizations.checkList.value;

            scope.checkListItems = function checkListItems(listSize) {

                /**
                 * If a change is detected but a number is not specified
                 * do nothing and return the list
                 */
                if (listSize === null) return checkList.list;
                if (listSize < 0) scope.customizations.number.value = 0;


                /**
                 * Determine the amount of elements needed to add to the
                 * checkList and push them on the checkList.list array.
                 * Number needed to add is calculated by the input arg,
                 * "listSize" subtracted by the length of checkList.list.length
                 */
                for (var i = 0; i < listSize - checkList.list.length; ++i) {
                    checkList.list.push({
                        value: "", 
                        isChecked: false, 
                        index: checkList.list.length
                    });
                }

                /**
                 * If any the checkList size becomes a smaller number
                 * less than the previous configuration, remove the
                 * last elements that are extending past the maximum
                 * list size
                 */
                for (i = 0; i < checkList.list.length - listSize; ++i) {
                    var poppedItem = checkList.list.pop();
                    if (poppedItem.isChecked)
                        --checkList.checked;
                }

                /* reset the checkAll toggle if a change is detected */
                var checked = checkList.checked;
                var listLength = checkList.list.length;
                checkList.toggle = (checked === listLength && listLength !== 0) ? true : false;

                return checkList.list;
            };

            /**

             */
            scope.checkBox = function checkBox(item) {

                var checkList = scope.customizations.checkList.value;

                checkList.checked += (item.isChecked) ? -1 : 1;
                checkList.toggle = (checkList.checked === checkList.list.length) ? true : false;
            };

            scope.checkAll = function checkAll() {
               
                var checkList = scope.customizations.checkList.value;

                for (var i = 0; i < checkList.list.length; ++i)
                    checkList.list[i].isChecked = !checkList.toggle;

                checkList.checked = (checkList.checked === checkList.list.length) ? 0 : checkList.list.length;
            };

        }

        return new ParlayWidgetTemplate({
            title: "Check List",
            templateUrl: "../vendor_components/promenade/widget/directives/promenade-widget-checklist.html",
            customizationDefaults: {
                number: {
                    property_name: "Check List Size",
                    value: 0,
                    type: "number"
                },
                checkList: {
                    hidden: true,
                    value: {
                        list: [],
                        checked: 0,
                        toggle: false
                    }
                }
            },
            customLink: customLink
        }, display_name);
    }
}());