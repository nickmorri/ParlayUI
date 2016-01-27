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

    // Holds state of more detail visibility and the corresponding icon to indicate this state to the user.
    this.more_hidden = true;
    this.more_icon = "arrow_drop_down";

    /**
     * Toggles state of more details visibility.
     */
    this.toggleMore = function () {
        this.more_hidden = !this.more_hidden;
        if (this.more_hidden) this.more_icon = "arrow_drop_down";
        else this.more_icon = "arrow_drop_up";
    };

    /**
     * Hides $mdDialog, this will resolve the function that launched this dialog.
     */
    this.close = function () {
        $mdDialog.hide();
    };

}

angular.module("parlay.notification.error", ["ngMaterial", "parlay.notification"])
    .controller("ParlayErrorDialogController", ["$mdDialog", ParlayErrorDialogController])
    .factory("ParlayErrorDialog", ["$mdDialog", "$mdMedia", "ParlayNotificationHistory", ParlayErrorDialog]);