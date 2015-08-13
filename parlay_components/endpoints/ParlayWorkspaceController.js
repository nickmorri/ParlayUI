var workspace_controller = angular.module('parlay.endpoints.workspaces', ['parlay.store', 'parlay.endpoints.manager', 'angularMoment']);

workspace_controller.controller('WorkspaceManagementController', ['$scope', '$mdDialog', 'ParlayLocalStore', 'ParlayEndpointManager', function ($scope, $mdDialog, ParlayLocalStore, ParlayEndpointManager) {
	$scope.hide = $mdDialog.hide;
	$scope.cancel = $mdDialog.cancel;
	
	function getSavedWorkspaces() {
		var workspaces = ParlayLocalStore('packed').values();
		return Object.keys(workspaces).map(function (key) {
			var workspace = workspaces[key];
			workspace.timestamp = new Date(workspace.timestamp);
			workspace.endpoint_count = Object.keys(workspace.data).length;
			return workspace;
		});
	};
	
	var saved_workspaces = getSavedWorkspaces();
	
	$scope.getSavedWorkspaces = function () {
		return saved_workspaces;
	};
	
	$scope.saveCurrentWorkspace = function () {
		
	};
	
	$scope.clearCurrentWorkspace = function () {
		ParlayEndpointManager.clearActiveEndpoints();
	};
	
	$scope.saveWorkspace = function (workspace) {
		ParlayLocalStore('endpoints').pack(workspace.name);
		saved_workspaces = getSavedWorkspaces();
	};
	
	$scope.loadWorkspace = function (workspace) {
		$scope.clearCurrentWorkspace();
		ParlayLocalStore('endpoints').unpack(workspace.name);
		ParlayEndpointManager.loadWorkspace(workspace);
		$scope.hide();
	};
	
	$scope.currentWorkspaceEndpointCount = function () {
		return ParlayLocalStore('endpoints').keys().filter(function (key) {
			return key.startsWith('endpoints-');
		}).length;
	};
	
}]);