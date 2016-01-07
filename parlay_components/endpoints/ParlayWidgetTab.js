function ParlayWidgetTab() {
	return {
		scope: {
			endpoint: '='
		},
		templateUrl: "../parlay_components/endpoints/directives/parlay-widget-tab.html",
		controller: function ($scope) {
							
			$scope.getAvailableDirectives = function () {
				var directives = $scope.endpoint.getAvailableDirectives();

				for (var target in directives) {
					if (directives[target].length <= 0) delete directives[target];
				}
				return directives;
			};
			
			$scope.activateDirective = function (target, directive) {
				$scope.$parent.activateDirective(target, directive);
			};
							
		}
	};
}

angular.module("parlay.endpoints.widgettab", [])
	.directive("parlayWidgetTab", ParlayWidgetTab);