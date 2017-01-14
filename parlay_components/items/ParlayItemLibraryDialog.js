(function () {
    "use strict";

    var module_dependencies = ['templates-main', 'parlay.items.search'];

    angular
        .module('parlay.items.library', module_dependencies)
        .factory('ParlayItemLibraryDialog', ParlayItemLibraryDialogFactory);

    ParlayItemLibraryDialogFactory.$inject = ['$mdDialog'];
    /**
     * Handles providing [ParlayItem]{@link module:ParlayItem.ParlayItem}s to the mdAutocomplete directive.
     * @constructor module:ParlayItem.ParlayItemLibraryDialog
     * @param {Object} $scope - AngularJS $scope Object.
     * @param {Object} $mdSidenav - Angular Material sidenav service.
     * @param {Object} $mdDialog - Angular Material dialog service.
     * @param {Object} ParlayItemManager - ParlayItemManager service.
     */
    function ParlayItemLibraryDialogFactory ($mdDialog) {

        function ParlayItemLibraryDialog() {
        }

        ParlayItemLibraryDialog.prototype.openItemsDialog = function() {
            $mdDialog.show({
                templateUrl: "../parlay_components/items/directives/parlay-item-library-dialog.html",
                controller: "ParlayItemSearchController",
                controllerAs: "ctrl",
                clickOutsideToClose: false
            });
        };


        return new ParlayItemLibraryDialog();
    }
}());