(function () {
    "use strict";

    var display_name = "Checklist Input";
    var module_dependencies = ["parlay.data"];
    var module_name = "promenade.widget.checklist";
    var directive_name = "promenadeWidgetChecklist";
    var wigdet_type = "input";
    var directive_definition = promenadeWidgetChecklistJs;

    widgetRegistration(display_name, module_name, module_dependencies, directive_name, wigdet_type, directive_definition, []);


    promenadeWidgetChecklistJs.$inject = ["ParlayWidgetTemplate", "$compile"];
    function promenadeWidgetChecklistJs(ParlayWidgetTemplate, $compile) {

        function customLink(scope) {

            scope.oldNum = 0;

            scope.checkListItems = function checkListItems(num) {

                var checkList = scope.customizations.checkList.value;
                var copyList = scope.customizations.checkListCopy.value;

                /**
                 * if the configuration change is detected
                 * copy the existing list's data into a new object.
                 * Once the change is completed, copy the copied
                 * list back in the main storage container
                 */
                if (num != checkList.list.length) {

                    if (num === "") angular.copy(checkList, copyList);
                    else if (num !== scope.oldNum) angular.copy(copyList, checkList);
                }

                /**
                 * Determine the amount of elements needed to add to the
                 * checkList and push them on the checkList.list array.
                 * Number needed to add is calculated by the input arg,
                 * "num" subtracted by the length of checkList.list.length
                 */
                for (var i = 0; i < num - checkList.list.length; ++i)
                    checkList.list.push({
                        value: "", 
                        isChecked: false, 
                        index: checkList.list.length
                    });
                
                /**
                 * If any the checkList size becomes a smaller number
                 * less than the previous configuration, remove the
                 * last elements that are extending past the maximum
                 * list size
                 */
                for (i = 0; i < checkList.list.length - num; ++i) {
                    var popped = checkList.list.pop();
                    if (popped.isChecked)
                        --checkList.checked;
                }

                /**
                 * reset the checkAll toggle if a change is detected
                 */
                if (num != checkList.list.length) {
                    checkList.toggle = (checkList.checked === checkList.list.length) ? true : false;
                    if (num !== "")
                        scope.oldNum = num;
                }

                return checkList.list;
            };

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
            title: "Checklist",
            templateUrl: "../vendor_components/promenade/widget/directives/promenade-widget-checklist.html",
            customizationDefaults: {
                number: {
                    property_name: "Check List Size",
                    value: 0,
                },
                inputtype: {
                    hidden: true,
                    property_name: "inputtype",
                    value: "number"
                },
                checkList: {
                    hidden: true,
                    value: {
                        list: [],
                        checked: 0,
                        toggle: false
                    }
                },
                checkListCopy: {
                    hidden: true,
                    value: {
                        list: [],
                        checked: 0,
                        toggle: false
                    }
                },
            },
            properties: {
                text: {
                    default: "",
                }
            },
            customLink: customLink
        });
    }
}());