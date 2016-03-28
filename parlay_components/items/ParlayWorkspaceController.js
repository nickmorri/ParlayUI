function ParlayWorkspaceManagementController($scope, $mdDialog, $mdMedia, ParlayNotification, ParlayStore, ParlayItemManager, PromenadeBroker) {

    function getWorkspaces() {
        var workspaces = store.values();
        return Object.keys(workspaces).map(function (key) {
            return workspaces[key];
        }).map(function (workspace) {
            workspace.timestamp = new Date(workspace.timestamp);
            workspace.item_count = Object.keys(workspace.data).length;
            return workspace;
        });
    }

    // Reference to ParlayStore Object that manages the items namespace.
    var store = ParlayStore("items");

    // Array of all saved workspaces in the items namespace.
    var saved_workspaces = getWorkspaces();

    this.hide = $mdDialog.hide;

    /**
     * Returns all saved workspaces except for those that were autosaved.
     * @returns {Array} - Array of workspace objects.
     */
    this.getSavedWorkspaces = function () {
        return saved_workspaces.filter(function (workspace) {
            return !workspace.autosave;
        });
    };

    /**
     * Returns autosaved workspace Object.
     * @returns {Object}
     */
    this.getAutosave = function () {
        return saved_workspaces.find(function (workspace) {
            return workspace.autosave;
        });
    };

    /**
     * Saves current items in workspace to a workspace of the name collected by launching a
     * $mdDialog to allow user to name the saved workspace.
     */
    /* istanbul ignore next */
    this.saveCurrentWorkspaceAs = function () {
        $mdDialog.show($mdDialog.prompt()
            .title("Save")
            .placeholder("Name")
            .ariaLabel("Name")
            .ok("Save")
            .cancel("Cancel"))
        .then(function (name) { this.saveWorkspace({name: name}); }.bind(this));
    };

    /**
     * Clears the workspace of all items currently active.
     */
    this.clearCurrentWorkspace = function () {
        ParlayItemManager.clearActiveItems();
    };

    /**
     * Saves the items active in the workspace to a workspace with the given name.
     * @param {Object} workspace - Workspace container Object.
     */
    this.saveWorkspace = function (workspace) {
        ParlayItemManager.saveWorkspace(workspace);
        saved_workspaces = getWorkspaces();
        ParlayNotification.show({content: "Saved '" + workspace.name + "' workspace."});
    };

    /**
     * Loads the given saved workspace, items are made active on the current workspace.
     * @param {Object} workspace - Workspace container Object.
     */
    this.loadWorkspace = function (workspace) {

        this.clearCurrentWorkspace();

        function load() {

            var result = ParlayItemManager.loadWorkspace(workspace);

            if (result.failed_items.length === 0) {
                ParlayNotification.show({content: "Restored " + result.loaded_items.length + " items from " + workspace.name + " workspace."});
            }
            else {

                var failed_item_names = "{"+ result.failed_items.map(function (container) {
                    return container.name;
                }).join(',') + "}";

                var loaded_item_names = "{" + result.loaded_items.map(function (container) {
                    return container.name;
                }).join(',') + "}";

                $mdDialog.show($mdDialog.alert({
                    title: 'Workspace load did not complete successfully',
                    textContent: loaded_item_names + ' loaded successfully. ' + failed_item_names + ' failed to load. Ensure that all protocols are connected.',
                    ok: 'Dismiss'
                }));
            }
        }

        if (ParlayItemManager.hasDiscovered()) load();
        else PromenadeBroker.requestDiscovery().then(load);

        $mdDialog.hide();
    };

    /**
     * Deletes the given saved workspace.
     * @param {Object} workspace - Workspace container Object.
     */
    this.deleteWorkspace = function (workspace) {
        store.remove(workspace.name);
        saved_workspaces = getWorkspaces();
        ParlayNotification.show({content: "Deleted '" + workspace.name + "' workspace."});
    };

    /**
     * @returns {Number} - active items.
     */
    this.currentWorkspaceItemCount = function () {
        return ParlayItemManager.getActiveItemCount();
    };

    /**
     * Clears all saved workspaces if the user confirms the $mdDialog.
     * @param {event} - Used to set source of dialog animation.
     */
    this.clearSavedWorkspaces = function (event) {
        var confirm = $mdDialog.confirm()
            .title('Would you like to clear all saved workspaces?')
            .textContent('This cannot be undone.')
            .ariaLabel('Clear saved workspaces')
            .targetEvent(event)
            .ok('Clear all workspaces')
            .cancel('Close');
        $mdDialog.show(confirm).then(function () {
            store.clear();
            saved_workspaces = getWorkspaces();
            ParlayNotification.show({content: "Cleared all saved workspaces."});
        });
    };

    /**
     * Downloads the saved workspaces to a JSON stringified file.
     */
    this.exportSavedWorkspaces = function () {
        store.export().download("saved_workspaces_" + new Date().toISOString() + ".txt");
    };

    /**
     * Emulates click on hidden input element which will open file selection dialog.
     * @param event - Mouse click event
     */
    this.importSavedWorkspaces = function (event) {
        event.target.parentElement.parentElement.getElementsByTagName("input")[0].click();
    };

    /**
     * Called when input element is changed. Contents of file are passed to ParlayStore once loaded.
     * @param event - Mouse click event
     */
    this.fileChanged = function (event) {

        // Instantiate FileReader object
        var fileReader = new FileReader();

        $scope.$apply(function () {
            "use strict";
            // After file load pass saved discovery data to the PromenadeBroker
            fileReader.onload = function (event) {
                store.import(event.target.result);
                saved_workspaces = getWorkspaces();
            };
        });

        // Read file as text
        fileReader.readAsText(event.target.files[0]);
    };


    // Attach reference to $mdMedia to scope so that media queries can be done.
    $scope.$mdMedia = $mdMedia;

}

angular.module("parlay.items.workspaces", ["parlay.store", "parlay.items.manager", "angularMoment", "parlay.utility"])
	.controller("ParlayWorkspaceManagementController", ["$scope", "$mdDialog", "$mdMedia", "ParlayNotification", "ParlayStore", "ParlayItemManager", "PromenadeBroker", ParlayWorkspaceManagementController]);