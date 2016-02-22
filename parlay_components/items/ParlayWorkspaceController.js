function ParlayWorkspaceManagementController($scope, $mdDialog, $mdMedia, ParlayNotification, ParlayStore, ParlayItemManager, PromenadeBroker) {

    function getWorkspaces() {
        var workspaces = store.getLocalValues();
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
    this.saveCurrentWorkspaceAs = function () {
        $mdDialog.show({
            controller: "ParlayWorkspaceSaveAsDialogController",
            controllerAs: "ctrl",
            templateUrl: "../parlay_components/items/directives/parlay-workspace-save-as-dialog.html",
            onComplete: function (scope, element) {
                element.find("input").focus();
            },
            fullscreen: !$mdMedia("gt-sm")
        }).then(this.saveWorkspace);
    };

    /**
     * Clears the workspace of all items currently active.
     */
    this.clearCurrentWorkspace = function () {
        ParlayItemManager.clearActiveItems();
        store.clearSession();
    };

    /**
     * Saves the items active in the workspace to a workspace with the given name.
     * @param {Object} workspace - Workspace container Object.
     */
    this.saveWorkspace = function (workspace) {
        store.moveItemToLocal(workspace.name);
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
            store.moveItemToSession(workspace.name);
            if (ParlayItemManager.loadWorkspace(workspace))
                ParlayNotification.show({content: "Restored workspace from " + workspace.name + "."});
            else
                ParlayNotification.show({content: "Unable to restore workspace from " + workspace.name + ". Ensure items have been discovered."});
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
        store.removeLocalItem(workspace.name);
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
            store.clearLocal();
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
        event.target.parentElement.parentElement.parentElement.getElementsByTagName("input")[0].click();
    };

    /**
     * Called when input element is changed. Contents of file are passed to ParlayStore once loaded.
     * @param event - Mouse click event
     */
    this.fileChanged = function (event) {

        // Instantiate FileReader object
        var fileReader = new FileReader();

        // After file load pass saved discovery data to the PromenadeBroker
        fileReader.onload = function (event) {
            store.import(event.target.result);
            saved_workspaces = getWorkspaces();
        };

        // Read file as text
        fileReader.readAsText(event.target.files[0]);
    };

    $scope.$mdMedia = $mdMedia;

}

function ParlayWorkspaceSaveAsDialogController($scope, $mdDialog) {

    /**
     * Resolves $mdDialog promise with the name entered in the input.
     */
	this.save = function () {
		$mdDialog.hide({name: $scope.name});
	};

    /**
     * Rejects the $mdDialog promise.
     */
	this.cancel = function () {
		$mdDialog.cancel();
	};
	
}

angular.module("parlay.items.workspaces", ["parlay.store", "parlay.items.manager", "angularMoment", "parlay.utility"])
	.controller("ParlayWorkspaceSaveAsDialogController", ["$scope", "$mdDialog", ParlayWorkspaceSaveAsDialogController])
	.controller("ParlayWorkspaceManagementController", ["$scope", "$mdDialog", "$mdMedia", "ParlayNotification", "ParlayStore", "ParlayItemManager", "PromenadeBroker", ParlayWorkspaceManagementController]);