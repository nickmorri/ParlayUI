/**
 * Created by nick on 1/19/16.
 */

function ParlayNotificationSidenav() {
    return {
        scope: {},
        templateUrl: "../parlay_components/notification/directives/parlay-notification-sidenav.html",
        controller: "ParlayNotificationSidenavController",
        controllerAs: "ctrl"
    };
}

function ParlayNotificationSidenavController($mdSidenav, ParlayNotificationHistory) {

    this.close = function () {
        "use strict";
        $mdSidenav("notifications").close();
    };

    this.notificationHistory = function () {
        "use strict";
        return ParlayNotificationHistory.get();
    };

}

angular.module("parlay.notification.sidenav", ["ngMaterial", "parlay.notification"])
    .controller("ParlayNotificationSidenavController", ["$mdSidenav", "ParlayNotificationHistory", ParlayNotificationSidenavController])
    .directive("parlayNotificationSidenav", ParlayNotificationSidenav);