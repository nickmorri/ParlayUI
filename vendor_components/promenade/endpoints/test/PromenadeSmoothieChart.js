(function () {
    'use strict';

	var directive_string = '<promenade-smoothie-chart class="parlay-endpoint-card-tab-content" delay="1000" streams="data" config="chart_config" smoothie-fn="getSmoothie"></promenade-smoothie-chart>';

    describe('promenade.smoothiechart', function() {
    
        describe('<promenade-smoothie-chart>', function() {
            var scope, element, controller;
            
            beforeEach(inject(function($rootScope, $compile, $controller) {
                /*jshint newcap: false */
                scope = $rootScope.$new();
                
                scope.data = {};
                
                scope.chart_config = {
			        grid: {
				        fillStyle: 'transparent',
				        strokeStyle: 'transparent',
				        borderVisible: false
				    },
				    labels: {
					    fillStyle: '#000000',
					    fontSize: 12
					}
				};
                
                element = $compile(directive_string)(scope);
                $rootScope.$digest();
                
                controller = $controller("PromenadeSmoothieChartController", {$scope: scope});
            }));
            
        });
        
    });
    
}());