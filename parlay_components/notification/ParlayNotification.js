(function () {
    "use strict";

    /**
     * @module ParlayNotification
     *
     * @description
     * Handles distributing notifications to
     * [Angular Material Toast]{@link https://material.angularjs.org/latest/demo/toast}s and the browser desktop
     * [Notification API]{@link https://developer.mozilla.org/en-US/docs/Web/API/notification}.
     *
     * @example
     *
     * ParlayNotification.show({content: "Text you want to display."});
     *
     * @example
     *
     * ParlayNotification.show({
     *      content: "Text you want to display.",
     *      action: {
     *          text: "Text that the action button displays.",
     *          callback: "Function to invoke when Toast action is clicked."
     *      },
     *      warning: true // Only true if the given notification is a warning and should be styled as such.
     * });
     *
     */

    var module_dependencies = ["ngMaterial", "templates-main"];

    angular
        .module("parlay.notification", module_dependencies)
        .run(RunNotification)
        .value("NotificationDisplayDuration", 4000)
        .value("NotificationLocation", "bottom right")
        .factory("ParlayNotificationHistory", ParlayNotificationHistoryFactory)
        .factory("ParlayNotification", ParlayNotificationFactory);

    /* istanbul ignore next */
    function RunNotification() {
        if ("Notification" in window) {
            // Request permissions as soon as possible.
            Notification.requestPermission();
        }
    }
    
    function ParlayNotificationHistoryFactory () {

        /**
         * Stores the contents of all previously displayed notifications.
         * @returns {Object}
         * @constructor module:ParlayNotification.ParlayNotificationHistory
         */
        function ParlayNotificationHistory () {

            /**
             * Holds ParlayNotificationHistoryItems.
             * @member module:ParlayNotification.ParlayNotificationHistory#container
             * @private
             * @type {Array}
             */
            var container = [];

            this.add = add;
            this.get = get;
            this.clear = clear;

            /**
             * Records toast contents and action.
             * @member module:ParlayNotification.ParlayNotificationHistory#add
             * @public
             * @param {(String|Object)} contents - Contents of notification that was displayed.
             * @param {String} [action.text] - Text that was displayed on the action button.
             * @param {Function} [action.callback] - Function that the action button would invoke.
             */
            function add (contents, action) {
                container.push(new ParlayNotificationHistoryItem(contents, action));
            }

            /**
             * Returns the entire contents of ParlayNotificationHistory.
             * @member module:ParlayNotification.ParlayNotificationHistory#get
             * @public
             * @returns {Array}
             */
            function get () {
                return container;
            }

            /**
             * Clears the entire contents of ParlayNotificationHistory.
             * @member module:ParlayNotification.ParlayNotificationHistory#clear
             * @public
             */
            function clear () {
                container = [];
            }

        }

        /**
         * Represents one previously shown notification.
         * @constructor module:ParlayNotification.ParlayNotificationHistoryItem
         * @param {Object} contents - Data associated with the notification.
         * @param {Object} [action] - Optional action that was provided for user interaction with the notification.
         */
        function ParlayNotificationHistoryItem (contents, action) {
            this.time = new Date();
            this.contents = contents;
            this.action = action;
            if (this.action) {
                // On initialization note that the action has not yet been called.
                this.action.called = false;
            }
        }

        /**
         * Call the callback function of the action Object on the notification.
         * @member module:ParlayNotification.ParlayNotificationHistoryItem#invokeCallback
         * @public
         */
        ParlayNotificationHistoryItem.prototype.invokeCallback = function () {
            this.action.callback();
            this.action.called = true;
        };

        return new ParlayNotificationHistory();
    }

    ParlayNotificationFactory.$inject = ["$mdToast", "$mdSidenav", "$mdDialog", "$interval", "NotificationDisplayDuration", "NotificationLocation", "ParlayNotificationHistory"];
    function ParlayNotificationFactory ($mdToast, $mdSidenav, $mdDialog, $interval, NotificationDisplayDuration, NotificationLocation, ParlayNotificationHistory) {

        /**
         * Service that allows other ParlayUI components to easily display a
         * [Angular Material Toast]{@link https://material.angularjs.org/latest/api/service/$mdToast} or
         * browser desktop [Notification]{@link https://developer.mozilla.org/en-US/docs/Web/API/notification}
         * depending on the visibility of the ParlayUI. Interacts with
         * [ParlayNotificationHistory]{@link module:ParlayNotification.ParlayNotificationHistory} to record a history of notifications.
         *
         * @constructor module:ParlayNotification.ParlayNotification
         *
         * @example <caption> Text-only notification.</caption>
         * ParlayNotification.show({
         *      content: "Text you want to display."
         * });
         *
         * @example <caption> Text-only notification with warning theme.</caption>
         * ParlayNotification.show({
         *      content: "Text you want to display.",
         *      warning: true // Only true if the given notification is a warning and should be styled as such.
         * });
         *
         * @example <caption> Notification with action button.</caption>
         * ParlayNotification.show({
         *      content: "Text you want to display.",
         *      action: {
         *          text: "Text that the action button displays.",
         *          callback: "Function to invoke when Toast action is clicked."
         *      }
         * });
         *
         */
        function ParlayNotification () {

            /**
             * True if a toast is currently being displayed, false otherwise.
             * @member module:ParlayNotification.ParlayNotification#toast_active
             * @private
             * @type {Boolean}
             */
            var toast_active = false;

            /**
             * Queue like Array containing Toast that are pending display, first-come first-served order.
             * @member module:ParlayNotification.ParlayNotification#pending_toasts
             * @private
             * @type {Array}
             */
            var pending_toasts = [];

            /**
             * Contains references to HTML5 Notification objects.
             * @member module:ParlayNotification.ParlayNotification#active_browser_notifications
             * @private
             * @type {Array}
             */
            var active_browser_notifications = [];

            // Attach methods.
            this.show = show;
            this.showProgress = showProgress;

            // If visibility of the document changes.
            /* istanbul ignore next */
            if ("Notification" in window) {
                document.addEventListener("visibilitychange", clearNotifications);
            }

            /**
             * Clear all browser notifications.
             * @member module:ParlayNotification.ParlayNotification#clearNotifications
             * @private
             */
            function clearNotifications () {
                active_browser_notifications.forEach(function (notification) {
                    notification.close();
                });
            }

            /**
             * Displays the next available toast.
             * Then if more toasts are available display then next as well as call the callback if the $mdToast was resolved by user action.
             * @member module:ParlayNotification.ParlayNotification#displayToast
             * @private
             */
            function displayToast () {
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
             * @member module:ParlayNotification.ParlayNotification#prepToast
             * @private
             */
            function prepToast (configuration) {
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
             * @member module:ParlayNotification.ParlayNotification#prepBrowserNotification
             * @private
             */
            function prepBrowserNotification (configuration) {
                if ("Notification" in window) {
                    active_browser_notifications.push(new Notification(configuration.content, {
                        delay: NotificationDisplayDuration
                    }));
                }
            }

            /**
             * Records contents and action from a toast in the notification history.
             * @param {Object} configuration - Toast configuration object.
             * @member module:ParlayNotification.ParlayNotification#addToHistory
             * @private
             */
            function addToHistory (configuration) {
                ParlayNotificationHistory.add(configuration.content, configuration.action);
            }

            /**
             * Creates Toast and if the browser window is currently hidden a HTML5 Notification.
             * @member module:ParlayNotification.ParlayNotification#show
             * @private
             * @param {String} configuration.content - Text to display on notification.
             * @param {String} configuration.action.text - Text that the action button displays.
             * @param {String} configuration.action.callback - Function to invoke when Toast action is clicked
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
             * @member module:ParlayNotification.ParlayNotification#showProgress
             * @private
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

        }

        return new ParlayNotification();
    }

}());