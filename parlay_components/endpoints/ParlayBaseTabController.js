/**
 * @name ParlayBaseTabController
 *
 * @description
 * The ParlayBaseTabController is a abstract controller that other Tab Controllers should inherit from.
 * 
 */

function ParlayBaseTabController($scope) {
	
	/**
	 * Destroys the controller's scope effectively removing the directive and all it's children.
	 * We're declaring this method in the constructor so that we have closure reach to $scope.
	 */
	this.closeTab = function () {
		$scope.$destroy();
	};
	
}