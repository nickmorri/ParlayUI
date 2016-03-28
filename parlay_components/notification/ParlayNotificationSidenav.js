/**
 * Created by nick on 1/19/16.
 */

/* istanbul ignore next */
function ParlayNotificationSidenav() {
    return {
        scope: {},
        templateUrl: "../parlay_components/notification/directives/parlay-notification-sidenav.html",
        controller: "ParlayNotificationSidenavController",
        controllerAs: "ctrl"
    };
}

/* istanbul ignore next */
function ParlayNotificationSidenavController($mdSidenav, ParlayNotificationHistory) {

    this.close = function () {
        $mdSidenav("notifications").close();
    };

    this.notificationHistory = function () {
        return ParlayNotificationHistory.get();
    };

}

angular.module("parlay.notification.sidenav", ["ngMaterial", "parlay.notification"])
    .controller("ParlayNotificationSidenavController", ["$mdSidenav", "ParlayNotificationHistory", ParlayNotificationSidenavController])
    .directive("parlayNotificationSidenav", ParlayNotificationSidenav);