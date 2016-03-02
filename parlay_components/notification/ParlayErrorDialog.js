function ParlayErrorDialog($mdDialog, $mdMedia, ParlayNotificationHistory) {

    return {
        show: function (from, description, details) {
            // Record message given to the dialog in the notification history.
            ParlayNotificationHistory.add({from: from, description: description, details: details});

            // Display the error dialog.
            $mdDialog.show({
                controller: "ParlayErrorDialogController",
                controllerAs: "ctrl",
                templateUrl: "../parlay_components/notification/directives/parlay-error-dialog.html",
                locals: {
                    from: from,
                    description: description,
                    details: details
                },
                bindToController: true,
                clickOutsideToClose: true,
                fullscreen: !$mdMedia("gt-sm")
            });
        }
    };

}

function ParlayErrorDialogController($mdDialog) {

    // Holds state of more detail visibility.
    this.more_hidden = true;

    /**
     * Toggles state of more details visibility.
     */
    this.toggleMore = function () {
        this.more_hidden = !this.more_hidden;
    };

    /**
     * Hides $mdDialog, this will resolve the function that launched this dialog.
     */
    /* istanbul ignore next */
    this.close = function () {
        $mdDialog.hide();
    };

}

angular.module("parlay.notification.error", ["ngMaterial", "parlay.notification"])
    .controller("ParlayErrorDialogController", ["$mdDialog", ParlayErrorDialogController])
    .factory("ParlayErrorDialog", ["$mdDialog", "$mdMedia", "ParlayNotificationHistory", ParlayErrorDialog]);