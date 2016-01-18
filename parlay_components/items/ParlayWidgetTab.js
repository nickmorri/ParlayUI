function ParlayWidgetTab() {
	return {
		scope: {
			item: '='
		},
		templateUrl: "../parlay_components/items/directives/parlay-widget-tab.html",
		controller: function ($scope) {
							
			$scope.getAvailableDirectives = function () {
				var directives = $scope.item.getAvailableDirectives();

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

angular.module("parlay.items.widgettab", [])
	.directive("parlayWidgetTab", ParlayWidgetTab);