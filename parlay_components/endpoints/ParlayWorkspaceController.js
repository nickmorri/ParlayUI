function ParlayWorkspaceManagementController($scope, $mdDialog, $mdMedia, ParlayStore, ParlayEndpointManager) {
	
	function getWorkspaces() {
		var workspaces = store.getLocalValues();
		return Object.keys(workspaces).map(function (key) {
			return workspaces[key];
		}).map(function (workspace) {
			workspace.timestamp = new Date(workspace.timestamp);
			workspace.endpoint_count = Object.keys(workspace.data).length;
			return workspace;
		});
	}
	
	var store = ParlayStore("endpoints");
	
	var saved_workspaces = getWorkspaces();
	
	$scope.hide = $mdDialog.hide;
	
	$scope.getSavedWorkspaces = function () {
		return saved_workspaces.filter(function(workspace) {
			return !workspace.autosave;
		});
	};
	
	$scope.getAutosave = function () {
		return saved_workspaces.find(function(workspace) {
			return workspace.autosave;
		});
	};
	
	$scope.saveCurrentWorkspace = function () {
		$mdDialog.show({
			controller: "ParlayWorkspaceSaveAsDialogController",
			controllerAs: "ctrl",
			templateUrl: "../parlay_components/endpoints/directives/parlay-workspace-save-as-dialog.html",
			onComplete: function (scope, element, options) {
	            element.find("input").focus();
            }
		}).then(function (name) {
			$scope.saveWorkspace({name: name});
		});
	};
	
	$scope.clearCurrentWorkspace = function () {
		ParlayEndpointManager.clearActiveEndpoints();
		store.clearSession();
	};
	
	$scope.saveWorkspace = function (workspace) {
		store.moveItemToLocal(workspace.name);
		saved_workspaces = getWorkspaces();
	};
	
	$scope.loadWorkspace = function (workspace) {
		
		$scope.clearCurrentWorkspace();
		
		function load() {
			store.moveItemToSession(workspace.name);
			ParlayEndpointManager.loadWorkspace(workspace);
		}
		
		if (ParlayEndpointManager.hasDiscovered()) load();
		else ParlayEndpointManager.requestDiscovery().then(load);
		
		$mdDialog.hide();		
	};
	
	$scope.deleteWorkspace = function (workspace) {
		store.removeLocalItem(workspace.name);
		saved_workspaces = getWorkspaces();
	};
	
	$scope.currentWorkspaceEndpointCount = function () {
		return ParlayEndpointManager.getActiveEndpointCount();
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
		$mdDialog.hide($scope.name);
	};
	
	this.cancel = function () {
		$mdDialog.cancel();
	};
	
}

angular.module("parlay.endpoints.workspaces", ["parlay.store", "parlay.endpoints.manager", "angularMoment"])
	.controller("ParlayWorkspaceSaveAsDialogController", ["$scope", "$mdDialog", ParlayWorkspaceSaveAsDialogController])
	.controller("ParlayWorkspaceManagementController", ["$scope", "$mdDialog", "$mdMedia", "ParlayStore", "ParlayEndpointManager", ParlayWorkspaceManagementController]);