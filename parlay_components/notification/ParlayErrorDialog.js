function ParlayErrorDialog($mdDialog, $mdMedia, ParlayNotificationHistory) {

    return {
        show: function (message) {
            // Record message given to the dialog in the notification history.
            ParlayNotificationHistory.add(message);

            // Display the error dialog.
            $mdDialog.show({
                controller: "ParlayErrorDialogController",
                controllerAs: "ctrl",
                templateUrl: "../parlay_components/notification/directives/parlay-error-dialog.html",
                locals: {
                    topics: message.TOPICS,
                    contents: message.CONTENTS
                },
                bindToController: true,
                clickOutsideToClose: true,
                fullscreen: !$mdMedia("gt-sm")
            });
        }
    };

}

function ParlayErrorDialogController($mdDialog) {

    this.close = function () {
        $mdDialog.hide();
    };

}

angular.module("parlay.notification.error", ["ngMaterial", "parlay.notification"])
    .controller("ParlayErrorDialogController", ["$mdDialog", ParlayErrorDialogController])
    .factory("ParlayErrorDialog", ["$mdDialog", "$mdMedia", "ParlayNotificationHistory", ParlayErrorDialog]);