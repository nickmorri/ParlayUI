var workspace_controller = angular.module('parlay.endpoints.workspaces', ['parlay.store', 'parlay.endpoints.manager', 'angularMoment']);

workspace_controller.controller('ParlayWorkspaceManagementController', ['$scope', '$mdDialog', 'ParlayStore', 'ParlayEndpointManager', function ($scope, $mdDialog, ParlayStore, ParlayEndpointManager) {
	$scope.hide = $mdDialog.hide;
	
	function getSavedWorkspaces() {
		return ParlayStore('packed').packedValues().map(function (workspace) {
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
			controller: 'ParlayWorkspaceSaveAsDialogController',
			templateUrl: '../parlay_components/endpoints/directives/parlay-workspace-save-as-dialog.html',
			onComplete: function (scope, element, options) {
	            element.find('input').focus();
            }
		}).then(function (name) {
			$scope.saveWorkspace({name: name});
		}, function (error) {});
	};
	
	$scope.clearCurrentWorkspace = function () {
		ParlayEndpointManager.clearActiveEndpoints();
		ParlayStore('endpoints').clear();
	};
	
	$scope.saveWorkspace = function (workspace) {
		ParlayStore('endpoints').packItem(workspace.name);
		saved_workspaces = getSavedWorkspaces();
	};
	
	$scope.loadWorkspace = function (workspace) {
		$scope.clearCurrentWorkspace();
		ParlayStore('endpoints').unpackItem(workspace.name);
		ParlayEndpointManager.loadWorkspace(workspace);
		$mdDialog.hide();
	};
	
	$scope.deleteWorkspace = function (workspace) {
		ParlayStore('endpoints').removePackedItem(workspace.name);
		saved_workspaces = getSavedWorkspaces();
	};
	
	$scope.currentWorkspaceEndpointCount = function () {
		return ParlayEndpointManager.getActiveEndpointCount();
	};
	
}]);

workspace_controller.controller('ParlayWorkspaceSaveAsDialogController', ['$scope', '$mdDialog', function ($scope, $mdDialog) {
	
	$scope.name = null;
	
	$scope.accept = function () {
		$mdDialog.hide($scope.name);
	};
	
	$scope.hide = function () {
		$mdDialog.cancel();
	};
	
}]);