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

            scope.checkList = {
                list: [
                    /* format for objects in checklist:
                     * {
                     *     value: value (string),
                     *     isChecked: isChecked (bool),
                     *     index: index (int)
                     * }
                     */
                        // {
                        //     value: "",
                        //     isChecked: false,
                        //     index: 0
                        // }
                    ],
                checked: 0,
                toggle: false
            };

            scope.checkListCopy = {                
                list: [],
                checked: 0,
                toggle: false
            };

            scope.oldNum = 0;

            scope.checkListItems = function checkListItems(num) {

                var checkList = scope.checkList;
                var copyList = scope.checkListCopy;

                if (num != scope.oldNum) {
                    if (num === "")
                        angular.copy(checkList, copyList);
                    else {
                        checkList = {};
                        angular.copy(copyList, checkList);
                    }
                }

                for (var i = 0; i < num - checkList.list.length; ++i)
                    checkList.list.push({
                        value: "", 
                        isChecked: false, 
                        index: checkList.list.length
                    });
                
                for (i = 0; i < checkList.list.length - num; ++i) {
                    checkList.list.pop();
                }

                if (scope.oldNum != num) {
                    checkList.toggle = (checkList.checked === checkList.list.length) ? true : false;
                    scope.oldNum = num;

                    console.log("checked count: " + checkList.checked);
                    console.log("list length count: " + checkList.list.length);
                }

                return checkList.list;
            };

            scope.checkBox = function checkBox(item) {

                var checkList = scope.checkList;

                checkList.checked += (item.isChecked) ? -1 : 1;
                checkList.toggle = (checkList.checked === checkList.list.length) ? true : false;
            };

            scope.checkAll = function checkAll() {
               
                var checkList = scope.checkList;

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
                    value: 0
                }
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