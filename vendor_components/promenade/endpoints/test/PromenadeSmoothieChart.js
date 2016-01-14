(function () {
    "use strict";

	beforeEach(module("promenade.smoothiechart"));

    describe("<promenade-smoothie-chart>", function() {
    
    	describe("construction", function () {
	    	var scope, element, controller, $compile, $controller, $rootScope;
	    	
	    	beforeEach(inject(function(_$rootScope_, _$compile_, _$controller_) {
                /*jshint newcap: false */
				$compile = _$compile_;
				$controller = _$controller_;
				$rootScope = _$rootScope_;
				
                scope = $rootScope.$new();
                
                scope.data = {};
                
            }));
            
            afterEach(function () {
	            scope.chart_config = {};
	            scope.data = {};
	            
	            scope.$destroy();
            });
	    	
	    	it("defaults delay to 1000 if user doesn't provide a value", function() {
		    	element = $compile('<promenade-smoothie-chart class="parlay-endpoint-card-tab-content" streams="data" config="chart_config" smoothie-fn="getSmoothie"></promenade-smoothie-chart>')(scope);
                $rootScope.$digest();
                
                var config = scope.getSmoothie();
                                
		    	expect(config.delay).toBe(1000);
	    	});
	    	
	    	it("sets delay to user preference", function () {
		    	element = $compile('<promenade-smoothie-chart class="parlay-endpoint-card-tab-content" delay="500" streams="data" config="chart_config" smoothie-fn="getSmoothie"></promenade-smoothie-chart>')(scope);
                $rootScope.$digest();
				
				var config = scope.getSmoothie();
                
		    	expect(config.delay).toBe(500);				
	    	});
	    	
	    	it("creates SmoothieChart object with default parameters", function () {
		    	
		    	element = $compile('<promenade-smoothie-chart class="parlay-endpoint-card-tab-content" delay="1000" streams="data" config="chart_config" smoothie-fn="getSmoothie"></promenade-smoothie-chart>')(scope);
                $rootScope.$digest();
                
                var config = scope.getSmoothie().options;
                                
				expect(config.grid).toEqual({
			        fillStyle: 'transparent',
			        strokeStyle: 'transparent',
			        lineWidth: 1,
			        sharpLines: false,
			        millisPerLine: 1000,
			        verticalSections: 2,
			        borderVisible: false
			    });
			    
			    expect(config.labels).toEqual({
				    disabled: false,
				    fontFamily: 'monospace',
				    precision: 2,
				    fillStyle: '#000000',
				    fontSize: 12
				});
	    	});
	    	
	    	it("creates SmoothieChart object with user defined parameters", function () {
		    	
		    	scope.chart_config = {
			        grid: {
				        fillStyle: "black",
				        strokeStyle: "transparent",
				        borderVisible: false
				    },
				    labels: {
					    fillStyle: "#000000",
					    fontSize: 20
					}
				};
				
				element = $compile('<promenade-smoothie-chart class="parlay-endpoint-card-tab-content" delay="1000" streams="data" config="chart_config" smoothie-fn="getSmoothie"></promenade-smoothie-chart>')(scope);
                $rootScope.$digest();
                
                var config = scope.getSmoothie().options;
                                
				expect(config.grid).toEqual({
			        fillStyle: 'black',
			        strokeStyle: 'transparent',
			        lineWidth: 1,
			        sharpLines: false,
			        millisPerLine: 1000,
			        verticalSections: 2,
			        borderVisible: false
			    });
			    
			    expect(config.labels).toEqual({
				    disabled: false,
				    fontFamily: 'monospace',
				    precision: 2,
				    fillStyle: '#000000',
				    fontSize: 20
				});                
				
	    	});
            
            it("initializes controller", function () {
	            
	            controller = $controller("PromenadeSmoothieChartController", {$scope: scope});
	            
	            expect(controller.lines).toEqual({});
	            expect(controller.colors).toEqual(["#000000", "#0433ff", "#aa7942", "#00fdff", "#00f900", "#ff40ff", "#ff9300", "#942192", "#ff2600", "#666633"]);
            });
            
    	});
    
        describe("general use", function() {
            var scope, element, controller, $interval;
            
            beforeEach(inject(function($rootScope, $compile, $controller, _$interval_) {
	            $interval = _$interval_;
                /*jshint newcap: false */
                scope = $rootScope.$new();
                
                scope.data = {};
                
                element = $compile('<promenade-smoothie-chart class="parlay-endpoint-card-tab-content" delay="1000" streams="data" config="chart_config" smoothie-fn="getSmoothie"></promenade-smoothie-chart>')(scope);
                controller = $controller("PromenadeSmoothieChartController", {$scope: scope});
                $rootScope.$digest();
            }));
            
            afterEach(function () {
	            scope.data = {};
	            
	            scope.$destroy();
            });
            
            it("adding a stream", function () {
	            
	            scope.data.stream2 = {
		            enabled: true,
		            value: 5,
		            ATTR_NAME: "stream2",
					NAME: "stream2",
					UNITS: "ms"
	            };
	            
	            expect(scope.getSmoothie().seriesSet.length).toBe(0);
	            
	            $interval.flush(1000);
	            scope.$digest();
	            
	            expect(scope.getSmoothie().seriesSet.length).toBe(1);
	            
            });
            
            it("removing a stream", function () {
	            
	            scope.data.stream2 = {
		            enabled: true,
		            value: 5,
		            ATTR_NAME: "stream2",
					NAME: "stream2",
					UNITS: "ms"
	            };
	            
	            expect(scope.getSmoothie().seriesSet.length).toBe(0);
	            
	            $interval.flush(1000);
	            scope.$digest();
	            
	            expect(scope.getSmoothie().seriesSet.length).toBe(1);
	            
	            delete scope.data.stream2;
	            
	            $interval.flush(1000);
	            scope.$digest();
	            
	            expect(scope.getSmoothie().seriesSet.length).toBe(0);
	            
            });
            
            it("adding multiple streams", function () {
	            
	            expect(scope.getSmoothie().seriesSet.length).toBe(0);
	            
	            for (var i = 0; i < 10; i++) {
		        	scope.data["stream" + i] = {
			            enabled: true,
			            value: i * 2,
			            ATTR_NAME: "stream" + i,
						NAME: "stream" + i,
						UNITS: "ms"
		            };    
	            }
	            
	            $interval.flush(1000);
	            scope.$digest();
	            
	            expect(scope.getSmoothie().seriesSet.length).toBe(10);
            });
            
            it("removing multiple streams", function () {
	            
	            expect(scope.getSmoothie().seriesSet.length).toBe(0);
	            
	            for (var i = 0; i < 10; i++) {
		        	scope.data["stream" + i] = {
			            enabled: true,
			            value: i * 2,
			            ATTR_NAME: "stream" + i,
						NAME: "stream" + i,
						UNITS: "ms"
		            };    
	            }
	            
	            $interval.flush(1000);
	            scope.$digest();
	            
	            expect(scope.getSmoothie().seriesSet.length).toBe(10);
	            
				for (i = 0; i < 10; i++) {
					delete scope.data["stream" + i];
				}
	            
	            $interval.flush(1000);
	            scope.$digest();

				expect(scope.getSmoothie().seriesSet.length).toBe(0);
	            
            });
            
            it("handles disabled streams", function () {
	           
	           scope.data.stream = {
		            enabled: true,
		            value: 5,
		            ATTR_NAME: "stream",
					NAME: "stream",
					UNITS: "ms"
	            };
	            
	            expect(scope.getSmoothie().seriesSet.length).toBe(0);
	            
	            $interval.flush(1000);
	            scope.$digest();
	            
	            expect(scope.getSmoothie().seriesSet.length).toBe(1);
	            
	            scope.data.stream.enabled = false;
	            
	            $interval.flush(1000);
	            scope.$digest();
	            
	            expect(scope.getSmoothie().seriesSet.length).toBe(0);
	            
	            scope.data.stream.enabled = true;
	            
	            $interval.flush(1000);
	            scope.$digest();
	            
	            expect(scope.getSmoothie().seriesSet.length).toBe(1);
	            
            });
            
            it("updates streams with latest available values", function() {
	            
	            scope.data.stream = {
		            enabled: true,
		            value: 5,
		            ATTR_NAME: "stream",
					NAME: "stream",
					UNITS: "ms"
	            };
	            
	            $interval.flush(1000);
	            scope.$digest();
	            
	            expect(scope.getSmoothie().seriesSet[0].timeSeries.data[scope.getSmoothie().seriesSet[0].timeSeries.data.length - 1][1]).toBe(5);
	            
	            scope.data.stream.value = 10;
	            
	            $interval.flush(1000);
	            scope.$digest();
	            
	            expect(scope.getSmoothie().seriesSet[0].timeSeries.data[scope.getSmoothie().seriesSet[0].timeSeries.data.length - 1][1]).toBe(10);
            });
            
        });
        
    });
    
}());