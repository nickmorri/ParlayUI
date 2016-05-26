(function () {
    "use strict";

    /**
     * @module ParlayNotification
     *
     * @description
     * Handles distributing notifications to Angular Material toasts and the browser desktop Notification API.
     *
     * General use of ParlayNotification.
     *
     * @example
     *
     * ParlayNotification.show({content: "Text you want to display."});
     *
     * With action button.
     *
     * @example
     *
     * ParlayNotification.show({
     *      content: "Text you want to display.",
     *	    action: {
     *		    text: "Text that the action button displays.",
     *		    callback: "Function to invoke when Toast action is clicked."
     *	    },
     *	    warning: True // Only true if the given notification is a warning and should be styled as such.
     *  });
     *
     */

    var module_dependencies = ["ngMaterial", "templates-main"];

    angular
        .module("parlay.notification", module_dependencies)
        .run(RunNotification)
        .value("NotificationDisplayDuration", 4000)
        .value("NotificationLocation", "bottom right")
        .factory("ParlayNotificationHistory", ParlayNotificationHistory)
        .factory("ParlayNotification", ParlayNotificationFactory);

    /* istanbul ignore next */
    function RunNotification() {
        if ("Notification" in window) {
            // Request permissions as soon as possible.
            Notification.requestPermission();
        }
    }

    /**
     * Stores the contents of all displayed toasts.
     */
    function ParlayNotificationHistory() {

        var history = [];

        function ParlayNotificationHistoryItem(contents, action) {
            this.time = new Date();
            this.contents = contents;
            this.action = action;
            if (this.action) {
                this.action.called = false;
            }
        }

        ParlayNotificationHistoryItem.prototype.invokeCallback = function () {
            this.action.callback();
            this.action.called = true;
        };

        /**
         * Records toast contents and action. Notes time it has been displayed.
         * @param {String|Object} contents - Contents of notification that was displayed.
         * @param {Object} action - Contains text of action button as well as a callback function.
         */
        function add (contents, action) {
            history.push(new ParlayNotificationHistoryItem(contents, action));
        }

        function get () {
            return history;
        }

        function clear () {
            history = [];
        }

        return {add: add, get: get, clear: clear};
    }

    ParlayNotificationFactory.$inject = ["$mdToast", "$mdSidenav", "$mdDialog", "$interval", "NotificationDisplayDuration", "NotificationLocation", "ParlayNotificationHistory"];
    function ParlayNotificationFactory ($mdToast, $mdSidenav, $mdDialog, $interval, NotificationDisplayDuration, NotificationLocation, ParlayNotificationHistory) {

        // True if a toast is currently being displayed.
        var toast_active = false;

        // Queue like Array containing Toast that are pending display, FCFS order.
        var pending_toasts = [];

        // Contains references to HTML5 Notification objects
        var active_browser_notifications = [];

        // Clear browser notifications if visibility of the document changes.
        /* istanbul ignore next */

        if ("Notification" in window) {
            document.addEventListener("visibilitychange", function clearNotifications() {
                active_browser_notifications.forEach(function (notification) {
                    notification.close();
                });
            });
        }

        /**
         * Displays the next available toast.
         * Then if more toasts are available display then next as well as call the callback if the $mdToast was resolved by user action.
         */
        function displayToast() {
            if (!pending_toasts.length) {
                return;
            }
            toast_active = true;
            var next_toast = pending_toasts.shift();
            $mdToast.show(next_toast.toast).then(function (result) {
                // If there are pending toasts remaining display the next toast.
                if (pending_toasts.length) {
                    displayToast();
                }
                toast_active = false;
                // Result will be resolved with "ok" if the action is performed and true if the $mdToast has hidden.
                if (result === "ok" && next_toast.callback) {
                    next_toast.callback();
                }
            });
        }

        /**
         * Creates $mdToast and shows it whenever we can, if nothing is currently shown show now otherwise show when no toast are being shown.
         * @param {Object} configuration - Notification configuration object.
         */
        function prepToast(configuration) {
            var toast = $mdToast.simple().content(configuration.content).position(NotificationLocation);

            // If the warning option is true we should theme the toast to indicate that a warning has occurred.
            if (configuration.warning) {
                toast.theme("warning-toast");
            }

            // Guess if the content that we want to add to the toast could overflow the container that is available.
            // TODO: Do check in more deterministic way that leverages DOM elements.
            var could_overflow = !angular.isString(configuration.content) || configuration.content.length > 60;

            if (configuration.permanent) {
                toast.hideDelay(false);
                // To ensure that the toast doesn't take priority over other toasts we should check every half second
                // for any pending toasts. If there are any pending toasts we should display them.
                var registration = $interval(function () {
                    if (pending_toasts.length) {
                        $interval.cancel(registration);
                        displayToast();
                    }
                }, 500);
            }

            if (configuration.action) {
                toast.action(configuration.action.text).highlightAction(true);

                pending_toasts.push({
                    toast: toast,
                    callback: function () {
                        configuration.action.called = true;
                        configuration.action.callback();
                    }
                });
            }
            else if (could_overflow) {
                toast.action("More").highlightAction(true);

                pending_toasts.push({
                    toast: toast,
                    callback: $mdSidenav("notifications").open
                });
            }
            else {
                pending_toasts.push({toast: toast});
            }

            if (!toast_active) {
                displayToast();
            }

        }

        /**
         * Creates Notification (HTML5 Notifications API) and stores a reference that can be cleared later.
         * @param {Object} configuration - Notification configuration object.
         */
        function prepBrowserNotification(configuration) {
            if ("Notification" in window) {
                active_browser_notifications.push(new Notification(configuration.content, {
                    delay: NotificationDisplayDuration
                }));
            }
        }

        /**
         * Records contents and action from a toast in the notification history.
         * @param {Object} configuration - Toast configuration object
         */
        function addToHistory(configuration) {
            ParlayNotificationHistory.add(configuration.content, configuration.action);
        }

        /**
         * Creates Toast and if the browser window is currently hidden a HTML5 Notification.
         * @param {Object} configuration - Notification configuration object.
         *
         * @example
         * {
		 *      content: "Text you want to display."
		 *	    action: {
		 *		    text: "Text that the action button displays.",
		 *		    callback: "Function to invoke when Toast action is clicked."
		 *	    }
		 *  }
         *
         */
        function show (configuration) {
            prepToast(configuration);
            addToHistory(configuration);

            if (document.hidden) {
                prepBrowserNotification(configuration);
            }
        }

        /**
         * Creates Toast that contains a linear indeterminate progress bar. Will remain indefinitely until hidden.
         * @param {$q.deferred.Promise} deferred - $q Promise that if resolved will hide the dialog.
         */
        function showProgress (deferred) {

            // Build the toast object which may be used to display an indeterminate progress.
            var toast = $mdToast.build()
                .template("<md-toast><span flex>Discovering</span><md-progress-linear flex class='notification-progress' md-mode='indeterminate'></md-progress-linear><md-toast>")
                .hideDelay(false)
                .position(NotificationLocation);

            // Show a dialog to indicate to the user that a discovery is in progress.
            $mdDialog.show({
                templateUrl: "../parlay_components/notification/directives/parlay-discovery-dialog.html",
                controller: function ($mdDialog) {

                    // Allow the user to hide the dialog.
                    this.hide = function () {
                        // If the user hides the dialog we should pass the deferred along so that the toast can be
                        // dismissed open deferred resolution.
                        $mdDialog.hide(deferred);
                    };

                    // If the deferred is resolved while the dialog is open we should reject the dialog's promise
                    // this will prevent the toast from being shown on dialog promise resolution.
                    deferred.promise.then($mdDialog.cancel);
                },
                locals: { deferred: deferred },
                bindToController: true,
                controllerAs: "ctrl",
                autoWrap: false,
                escapeToClose: false,
                clickOutsideToClose: false
            }).then(function (deferred) {

                function dismiss() {
                    $interval.cancel(registration);
                    $mdToast.hide();
                    displayToast();
                }

                // To ensure that the progress doesn't take priority over other toasts we should check every half second
                // for any pending toasts. If there are any pending toasts we should display them.
                var registration = $interval(function () {
                    if (pending_toasts.length) dismiss();
                }, 500);

                // Show $mdToast and when resolved (on toast hide) be sure to deregister the $interval.
                $mdToast.show(toast).then(registration);

                // If the deferred is resolved we should cancel the $interval registration and display any pending toast.
                deferred.promise.then(dismiss);

            });
        }

        return {show: show, showProgress: showProgress};
    }

}());