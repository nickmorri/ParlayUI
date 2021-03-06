(function () {
    "use strict";
    
    var module_dependencies = ["ngMaterial", "parlay.notification", "parlay.utility"];

    angular
        .module("parlay.common.genericsaveloaddialog", module_dependencies)
        .factory("ParlayGenericSaveLoadDialog", ParlayGenericSaveLoadDialogFactory)
        .controller("ParlayGenericSaveLoadDialogController", ParlayGenericSaveLoadDialogController);

    ParlayGenericSaveLoadDialogFactory.$inject = ["$mdDialog"];
    /**
     * A generic save / load dialog that allows the end-user to interact with a entry manager such as
     * [ParlayItemManager]{@link module:ParlayItem.ParlayItemManager}.
     *
     * Uses {@link ParlayGenericSaveLoadDialogController}.
     * @constructor module:ParlayCommon.ParlayGenericSaveLoadDialog
     *
     * @example <caption>Launching a ParlayGenericSaveLoadDialog with [ParlayItemManager]{@link module:ParlayItem.ParlayItemManager} as the designated manager.</caption>
     *
     * ParlayGenericSaveLoadDialog.show(event, ParlayItemManager, {
     *      entry: "workspace",
     *      entries: "workspaces",
     *      title: "workspaces",
     *      child: "item",
     *      children: "items"
     * });
     *
     */
    function ParlayGenericSaveLoadDialogFactory ($mdDialog) {

        /**
         * Launches the $mdDialog instance.
         * @param {Event} event - DOM Event that can be used to set an animation source for $mdDialog.
         * @param {Object} manager - A manager instance where entries will be interacted with.
         * @param {Object} options - Contains manager specific terminology.
         * @param {Object} options.entry - Name of singular entry.
         * @param {Object} options.entries - Name of plural entries.
         * @param {Object} options.title - Title of the dialog.
         * @param {Object} options.child - Name of a singular child of an entry.
         * @param {Object} options.children - Name of plural children of an entry.
         */
        function show (event, manager, options) {
            $mdDialog.show({
                templateUrl: "../parlay_components/common/directives/parlay-generic-save-load-dialog.html",
                targetEvent: event,
                controller: "ParlayGenericSaveLoadDialogController",
                controllerAs: "ctrl",
                clickOutsideToClose: true,
                locals: {
                    manager: manager,
                    options: options
                }
            });
        }

        return {
            show: show
        };
    }

    ParlayGenericSaveLoadDialogController.$inject = ["$scope", "$timeout", "$mdDialog", "$mdMedia", "ParlayNotification", "ParlayObject",
        "manager", "options"];
    /**
     * Controller for the {@link ParlayGenericSaveLoadDialog} $mdDialog.
     * @constructor ParlayGenericSaveLoadDialogController
     * @param {Object} $scope - AngularJS $scope Object.
     * @param {Object} $mdDialog - Angular Material dialog service.
     * @param {Object} $mdMedia - Angular Material media query service.
     * @param {Object} ParlayNotification - ParlayNotification service.
     * @param {Object} manager - A manager instance where entries will be interacted with.
     * @param {Object} options - Contains manager specific terminology.
     */
    function ParlayGenericSaveLoadDialogController ($scope, $timeout, $mdDialog, $mdMedia, ParlayNotification, ParlayObject, manager, options) {

        var ctrl = this;

        // Attach methods to controller.
        ctrl.getSaved = getSaved;
        ctrl.getAutosave = getAutosave;
        ctrl.clearActive = clearActive;
        ctrl.countActive = countActive;
        ctrl.saveActive = saveActive;
        ctrl.saveEntry = saveEntry;
        ctrl.loadEntry = loadEntry;
        ctrl.deleteEntry = deleteEntry;
        ctrl.clearSaved = clearSaved;
        ctrl.exportSaved = exportAll;
        ctrl.importSaved = importAll;
        ctrl.fileChanged = fileChanged;
        ctrl.hide = $mdDialog.hide;

        // Attach $mdMedia to scope so media queries can be done.
        $scope.$mdMedia = $mdMedia;

        // Attach options to scope so ng-bind can use the user defined options.
        $scope.options = options;

        /**
         * Returns all saved entries, except for those that were auto saved.
         * @method ParlayGenericSaveLoadDialogController#getSaved
         * @public
         * @returns {Array} - Array of entries.
         */
        function getSaved () {
            return manager.getSaved();
        }

        /**
         * Returns auto saved entry.
         * @method ParlayGenericSaveLoadDialogController#getAutosave
         * @public
         * @returns {Object} - auto saved entry.
         */
        function getAutosave () {
            return manager.getAutosave();
        }

        /**
         * Clears all active items.
         * @method ParlayGenericSaveLoadDialogController#clearActive
         * @public
         */
        function clearActive () {
            manager.clearActive();
        }

        /**
         * Count of all active items.
         * @method ParlayGenericSaveLoadDialogController#countActive
         * @public
         * @returns {Number}
         */
        function countActive () {
            return manager.countActive();
        }

        /**
         * Saves active items to an entry with the name that will be collected by $mdDialog.
         * @method ParlayGenericSaveLoadDialogController#saveActive
         * @public
         */
        /* istanbul ignore next */
        function saveActive () {
            var dialog = $mdDialog.prompt()
                .title("Save")
                .placeholder("Name")
                .ariaLabel("Name")
                .ok("Save")
                .cancel("Cancel");

            $mdDialog.show(dialog).then(function (name) {
                ctrl.saveEntry({name: name});
            });
        }

        /**
         * Saves the active items to the given entry.
         * @method ParlayGenericSaveLoadDialogController#saveEntry
         * @public
         * @param {Object} entry - Entry container Object.
         */
        function saveEntry (entry) {
            manager.saveEntry(entry);
            ParlayNotification.show({content: "Saved " + entry.name + "."});
        }

        /**
         * Loads the items from the given entry to the workspace and then makes them active.
         * @method ParlayGenericSaveLoadDialogController#loadEntry
         * @public
         * @param {Object} entry - Entry container Object.
         */
        function loadEntry (entry) {

            // Ensure that the references are severed to the saved entry and then load.
            var result = manager.loadEntry(angular.copy(entry));

            if (result.failed_items.length === 0) {
                ParlayNotification.show({content: "Restored " + result.loaded_items.length + " " + options.entries + " from " + entry.name + "."});
            }
            else {
                var loaded_entry_names = result.loaded_items.length > 0 ? result.loaded_items.map(function (container) {
                    return container.name;
                }).join(', ') : "No " + options.children;

                var failed_entry_names = result.failed_items.length > 0 ? result.failed_items.map(function (container) {
                    return container.name;
                }).join(', ') : "No " + options.children;

                $mdDialog.show($mdDialog.alert({
                    title: 'Load did not complete successfully',
                    textContent: loaded_entry_names + ' loaded successfully. ' + failed_entry_names + ' failed to load.',
                    ok: 'Dismiss'
                }));
            }

            $mdDialog.hide();
        }

        /**
         * Deletes the entry and its contained items.
         * @method ParlayGenericSaveLoadDialogController#deleteEntry
         * @public
         * @param {Object} entry - Entry container Object.
         */
        function deleteEntry (entry) {
            manager.deleteEntry(entry.name);
            ParlayNotification.show({content: "Deleted " + entry.name + "."});
        }

        /**
         * Clears all saved entries if the user confirms the $mdDialog.
         * @method ParlayGenericSaveLoadDialogController#clearSaved
         * @public
         * @param {Event} event - Used to set source of dialog animation.
         */
        function clearSaved (event) {
            var confirm = $mdDialog.confirm()
                .title('Would you like to clear all?')
                .textContent('This cannot be undone.')
                .ariaLabel('Clear all saved')
                .targetEvent(event)
                .ok('Clear all saved')
                .cancel('Close');
            $mdDialog.show(confirm).then(function () {
                manager.clearSaved();
                ParlayNotification.show({
                    content: "Cleared all saved."
                });
            });
        }

        /**
         * Downloads the saved entries to a JSON stringified file.
         * @method ParlayGenericSaveLoadDialogController#exportAll
         * @public
         */
        function exportAll () {
            var toExport = new ParlayObject(manager.export());
            toExport.download("saved_entries_" + new Date().toISOString() + ".txt");
        }

        /**
         * Emulates click on hidden input element which will open file selection dialog.
         * @method ParlayGenericSaveLoadDialogController#importAll
         * @public
         * @param {Event} event - Mouse click event
         */
        function importAll (event) {
            $timeout(function() {
                event.target.parentElement.parentElement.getElementsByTagName("input")[0].click();
            });
        }

        /**
         * Called when input element is changed. Contents of file are passed to ParlayStore once loaded.
         * @method ParlayGenericSaveLoadDialogController#fileChanged
         * @public
         * @param {Event} event - Mouse click event
         */
        function fileChanged (event) {

            // Instantiate FileReader object
            var fileReader = new FileReader();

            $scope.$apply(function () {
                fileReader.onload = function (event) {
                    manager.import(event.target.result);
                };
            });

            // Read file as text
            fileReader.readAsText(event.target.files[0]);
        }

    }

}());
