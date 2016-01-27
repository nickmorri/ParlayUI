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

    // Holds state of topics visibility and the corresponding icon to indicate this state to the user.
    this.topics_hidden = true;
    this.topics_icon = "arrow_drop_down";

    /**
     * Toggles state of topics visibility.
     */
    this.toggleTopics = function () {
        this.topics_hidden = !this.topics_hidden;
        if (this.topics_hidden) this.topics_icon = "arrow_drop_down";
        else this.topics_icon = "arrow_drop_up";
    };

    // Holds state of contents visibility and the corresponding icon to indicate this state to the user.
    this.contents_hidden = true;
    this.contents_icon = "arrow_drop_down";

    /**
     * Toggles state of contents visibility.
     */
    this.toggleContents = function () {
        this.contents_hidden = !this.contents_hidden;
        if (this.contents_hidden) this.contents_icon = "arrow_drop_down";
        else this.contents_icon = "arrow_drop_up";
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