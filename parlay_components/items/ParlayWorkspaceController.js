function ParlayWorkspaceManagementController($scope, $mdDialog, $mdMedia, ParlayNotification, ParlayStore, ParlayItemManager) {

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

    var store = ParlayStore("items");

    var saved_workspaces = getWorkspaces();

    this.hide = $mdDialog.hide;

    this.getSavedWorkspaces = function () {
        return saved_workspaces.filter(function (workspace) {
            return !workspace.autosave;
        });
    };

    this.getAutosave = function () {
        return saved_workspaces.find(function (workspace) {
            return workspace.autosave;
        });
    };

    this.saveCurrentWorkspace = function () {
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

    this.clearCurrentWorkspace = function () {
        ParlayItemManager.clearActiveItems();
        store.clearSession();
    };

    this.saveWorkspace = function (workspace) {
        store.moveItemToLocal(workspace.name);
        saved_workspaces = getWorkspaces();
        ParlayNotification.show({content: "Saved '" + workspace.name + "' workspace."});
    };

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
        else ParlayItemManager.requestDiscovery().then(load);

        $mdDialog.hide();
    };

    this.deleteWorkspace = function (workspace) {
        store.removeLocalItem(workspace.name);
        saved_workspaces = getWorkspaces();
        ParlayNotification.show({content: "Deleted '" + workspace.name + "' workspace."});
    };

    this.currentWorkspaceItemCount = function () {
        return ParlayItemManager.getActiveItemCount();
    };

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

    // Watch the size of the screen, if we are on a screen size that's greater than a small screen we should always display labels.
    $scope.$watch(function () {
        return $mdMedia('gt-md');
    }, function (large_screen) {
        $scope.large_screen = large_screen;
    });

}

function ParlayWorkspaceSaveAsDialogController($scope, $mdDialog) {
	
	this.save = function () {
		$mdDialog.hide({name: $scope.name});
	};
	
	this.cancel = function () {
		$mdDialog.cancel();
	};
	
}

angular.module("parlay.items.workspaces", ["parlay.store", "parlay.items.manager", "angularMoment"])
	.controller("ParlayWorkspaceSaveAsDialogController", ["$scope", "$mdDialog", ParlayWorkspaceSaveAsDialogController])
	.controller("ParlayWorkspaceManagementController", ["$scope", "$mdDialog", "$mdMedia", "ParlayNotification", "ParlayStore", "ParlayItemManager", ParlayWorkspaceManagementController]);