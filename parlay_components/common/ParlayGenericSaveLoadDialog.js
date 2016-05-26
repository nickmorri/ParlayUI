(function () {
    "use strict";

    var module_dependencies = ["ngMaterial", "angularMoment", "parlay.notification", "parlay.utility"];

    angular
        .module("parlay.common.genericsaveloaddialog", module_dependencies)
        .factory("ParlayGenericSaveLoadDialog", ParlayGenericSaveLoadDialogFactory)
        .controller("ParlayGenericSaveLoadDialogController", ParlayGenericSaveLoadDialogController);

    ParlayGenericSaveLoadDialogFactory.$inject = ["$mdDialog"];
    function ParlayGenericSaveLoadDialogFactory ($mdDialog) {

        /**
         * A generic save / load dialog that allows the end-user to interact with a entry manager.
         * @constructor
         * @param {Event} event - DOM Event that can be used to set an animation source for $mdDialog.
         * @param {Object} manager - A manager instance where entries will be interacted with.
         * @param {Object} options - Contains manager specific terminology.
         * @param {Object} options.entry - Name of singular entry.
         * @param {Object} options.entries - Name of plural entries.
         * @param {Object} options.title - Title of the dialog.
         * @param {Object} options.child - Name of a singular child of an entry.
         * @param {Object} options.children - Name of plural children of an entry.
         */
        function ParlayGenericSaveLoadDialog (event, manager, options) {
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

        return ParlayGenericSaveLoadDialog;
    }

    ParlayGenericSaveLoadDialogController.$inject = ["$scope", "$mdDialog", "$mdMedia", "ParlayNotification", "manager", "options"];
    /**
     * Controller for the ParlayGenericSaveLoadDialog $mdDialog.
     * @param $scope
     * @param $mdDialog
     * @param $mdMedia
     * @param ParlayNotification
     * @param manager
     * @param options
     * @constructor
     */
    function ParlayGenericSaveLoadDialogController ($scope, $mdDialog, $mdMedia, ParlayNotification, manager, options) {

        var ctrl = this;

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
        ctrl.hide = hide;

        // Attach $mdMedia to scope so media queries can be done.
        $scope.$mdMedia = $mdMedia;

        // Attach options to scope so ng-bind can use the user defined options.
        $scope.options = options;

        /**
         * Returns all saved entries, except for those that were auto saved.
         * @returns {Array} - Array of entries.
         */
        function getSaved () {
            return manager.getSaved();
        }

        /**
         * Returns auto saved entry.
         * @returns {Object} - auto saved entry.
         */
        function getAutosave () {
            return manager.getAutosave();
        }

        /**
         * Clears all active items.
         */
        function clearActive () {
            manager.clearActive();
        }

        /**
         * Count of all active items.
         * @returns {Number}
         */
        function countActive () {
            return manager.countActive();
        }

        /**
         * Saves active items to an entry with the name that will be collected by $mdDialog.
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
         * @param {Object} entry - Entry container Object.
         */
        function saveEntry (entry) {
            manager.saveEntry(entry);
            ParlayNotification.show({content: "Saved '" + entry.name + "."});
        }

        /**
         * Loads the items from the given entry to the workspace and then makes them active.
         * @param {Object} entry - Entry container Object.
         */
        function loadEntry (entry) {

            var result = manager.loadEntry(entry);

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
         * @param {Object} entry - Entry container Object.
         */
        function deleteEntry (entry) {
            manager.deleteEntry(entry.name);
            ParlayNotification.show({content: "Deleted " + entry.name + "."});
        }

        /**
         * Clears all saved entries if the user confirms the $mdDialog.
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
         */
        function exportAll () {
            manager.export().download("saved_entries_" + new Date().toISOString() + ".txt");
        }

        /**
         * Emulates click on hidden input element which will open file selection dialog.
         * @param {Event} event - Mouse click event
         */
        function importAll (event) {
            event.target.parentElement.parentElement.getElementsByTagName("input")[0].click();
        }

        /**
         * Called when input element is changed. Contents of file are passed to ParlayStore once loaded.
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

        /**
         * Dismiss the $mdDialog that this controller belongs to. Resolves the promise.
         */
        function hide () {
            $mdDialog.hide();
        }

    }

}());
