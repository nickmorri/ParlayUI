(function () {
    "use strict";

    var module_dependencies = ["ngMaterial", "parlay.notification"];

    angular
        .module("parlay.notification.sidenav", module_dependencies)
        .controller("ParlayNotificationSidenavController", ParlayNotificationSidenavController)
        .directive("parlayNotificationSidenav", ParlayNotificationSidenav);

    /* istanbul ignore next */
    ParlayNotificationSidenavController.$inject = ["$mdSidenav", "ParlayNotificationHistory"];
    function ParlayNotificationSidenavController ($mdSidenav, ParlayNotificationHistory) {

        this.close = function () {
            $mdSidenav("notifications").close();
        };

        this.notificationHistory = function () {
            return ParlayNotificationHistory.get();
        };

    }

    /* istanbul ignore next */
    function ParlayNotificationSidenav () {
        return {
            scope: {},
            templateUrl: "../parlay_components/notification/directives/parlay-notification-sidenav.html",
            controller: "ParlayNotificationSidenavController",
            controllerAs: "ctrl"
        };
    }

}());