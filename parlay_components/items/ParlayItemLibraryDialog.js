// (function () {
//     "use strict";
//
//     var module_dependencies = ["parlay.items.manager"];
//
//     angular
//         .module("parlay.items.library", module_dependencies)
//         .factory("ParlayItemLibraryDialog", ParlayItemLibraryDialog);
//
//
//
//     ParlayItemLibraryDialog.$inject = ["ParlayItemManager", "$mdDialog"];
//     function ParlayItemLibraryDialog(ParlayItemManager, $mdDialog) {
//         var ctrl = this;
//         ctrl.openItemDialog = openItemDialog;
//         ctrl.selectItem = ParlayItemManager.activateItem;
//
//         function openItemDialog() {
//             $mdDialog.show({
//                 templateUrl: "../parlay_components/items/directives/parlay-item-library-dialog.html",
//                 controller: "ParlayItemLibraryDialog",
//                 controllerAs: "ctrl",
//                 clickOutsideToClose: true
//             }).catch(function () {
//                 // return 1;
//                 // if (!scope.initialized)
//                 //     scope.widgetsCtrl.remove(scope.uid);
//             });
//         }
//
//
//     }
//
//
// }());