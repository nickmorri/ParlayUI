var workspace_controller = angular.module('parlay.endpoints.workspaces', ['parlay.store', 'parlay.endpoints.manager', 'angularMoment']);

workspace_controller.controller('WorkspaceManagementController', ['$scope', '$mdDialog', 'ParlayLocalStore', 'ParlayEndpointManager', function ($scope, $mdDialog, ParlayLocalStore, ParlayEndpointManager) {
	$scope.hide = $mdDialog.hide;
	$scope.cancel = $mdDialog.cancel;
	
	function getSavedWorkspaces() {
		return ParlayLocalStore('packed').packedValues().map(function (workspace) {
			workspace.timestamp = new Date(workspace.timestamp);
			workspace.endpoint_count = Object.keys(workspace.data).length;
			return workspace;
		});
	}
	
	var saved_workspaces = getSavedWorkspaces();
	
	$scope.getSavedWorkspaces = function () {
		return saved_workspaces;
	};
	
	$scope.saveCurrentWorkspace = function () {
		$mdDialog.show({
			controller: 'WorkspaceSaveAsDialogController',
			templateUrl: '../parlay_components/endpoints/directives/parlay-workspace-save-as-dialog.html',
		}).then(function (name) {
			$scope.saveWorkspace({name: name});
		}, function (error) {});
	};
	
	$scope.clearCurrentWorkspace = function () {
		ParlayEndpointManager.clearActiveEndpoints();
		ParlayLocalStore('endpoints').clear();
	};
	
	$scope.saveWorkspace = function (workspace) {
		ParlayLocalStore('endpoints').packItem(workspace.name);
		saved_workspaces = getSavedWorkspaces();
	};
	
	$scope.loadWorkspace = function (workspace) {
		$scope.clearCurrentWorkspace();
		ParlayLocalStore('endpoints').unpackItem(workspace.name);
		ParlayEndpointManager.loadWorkspace(workspace);
	};
	
	$scope.deleteWorkspace = function (workspace) {
		ParlayLocalStore('endpoints').removePackedItem(workspace.name);
		saved_workspaces = getSavedWorkspaces();
	};
	
	$scope.currentWorkspaceEndpointCount = function () {
		return ParlayEndpointManager.getActiveEndpointCount();
	};
	
}]);

workspace_controller.controller('WorkspaceSaveAsDialogController', ['$scope', '$mdDialog', function ($scope, $mdDialog) {
	
	$scope.name = null;
	
	$scope.accept = function () {
		$mdDialog.hide($scope.name);
	};
	
	$scope.hide = function () {
		$mdDialog.cancel();
	};
	
}]);