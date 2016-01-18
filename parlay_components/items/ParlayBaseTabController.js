/**
 * @name ParlayBaseTabController
 *
 * @description
 * The ParlayBaseTabController is a abstract controller that other Tab Controllers should inherit from.
 * 
 */

function ParlayBaseTabController($scope, tab_name) {
	
	/**
	 * Destroys the controller's scope effectively removing the directive and all it's children.
	 * We're declaring this method in the constructor so that we have closure reach to $scope.
	 */
	this.closeTab = function () {
		$scope.$destroy();
	};
	
	// When the $destroy event is dispatched we want to ensure that we remove our tab.
	$scope.$on("$destroy", function () {
		$scope.$parent.deactivateDirective("tabs", tab_name);
	});
	
}