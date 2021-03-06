(function () {
    "use strict";

	beforeEach(module("promenade.smoothiechart"));

    describe("<promenade-smoothie-chart>", function() {

    	describe("construction", function () {
	    	var scope, element, controller, $compile, $controller, $rootScope, ParlaySettings;
	    	
	    	beforeEach(inject(function(_$rootScope_, _$compile_, _$controller_, _ParlaySettings_) {
                /*jshint newcap: false */
				$compile = _$compile_;
				$controller = _$controller_;
				$rootScope = _$rootScope_;
				ParlaySettings = _ParlaySettings_;
				
                scope = $rootScope.$new();
                
                scope.data = {};
                scope.enabled_streams = [];
                
            }));
            
            afterEach(function () {
	            scope.chart_config = {};
	            scope.data = {};
				scope.enabled_streams = [];
	            
	            scope.$destroy();
            });
	    	
	    	it("defaults delay to 1000 if user doesn't provide a value", function() {
		    	element = $compile('<promenade-smoothie-chart class="parlay-item-card-tab-content" enabled_streams="enabled_streams" stream_data="data" config="chart_config" smoothie-fn="getSmoothie"></promenade-smoothie-chart>')(scope);
                $rootScope.$digest();
                
                var config = scope.getSmoothie();
                                
		    	expect(config.delay).toBe(1000);
	    	});
	    	
	    	it("sets delay to user preference", function () {
		    	element = $compile('<promenade-smoothie-chart class="parlay-item-card-tab-content" delay="500" enabled_streams="enabled_streams" stream_data="data" config="chart_config" smoothie-fn="getSmoothie"></promenade-smoothie-chart>')(scope);
                $rootScope.$digest();
				
				var config = scope.getSmoothie();
                
		    	expect(config.delay).toBe(500);				
	    	});
	    	
	    	it("creates SmoothieChart object with default parameters", function () {
		    	
		    	element = $compile('<promenade-smoothie-chart class="parlay-item-card-tab-content" delay="1000" enabled_streams="enabled_streams" stream_data="data" config="chart_config" smoothie-fn="getSmoothie"></promenade-smoothie-chart>')(scope);
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
				    fontSize: ParlaySettings.get("graph").label_size
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
				
				element = $compile('<promenade-smoothie-chart class="parlay-item-card-tab-content" delay="1000" enabled_streams="enabled_streams" stream_data="data" config="chart_config" smoothie-fn="getSmoothie"></promenade-smoothie-chart>')(scope);
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
            var scope, element, controller;
            
            beforeEach(inject(function($rootScope, $compile, $controller) {
                /*jshint newcap: false */
                scope = $rootScope.$new();
                
                scope.data = {};
                scope.enabled_streams = [];
                
                element = $compile('<promenade-smoothie-chart class="parlay-item-card-tab-content" delay="1000" enabled_streams="enabled_streams" stream_data="data" config="chart_config" smoothie-fn="getSmoothie"></promenade-smoothie-chart>')(scope);
                controller = $controller("PromenadeSmoothieChartController", {$scope: scope});
                $rootScope.$digest();
            }));
            
            afterEach(function () {
	            scope.data = {};
                scope.enabled_streams = [];
	            
	            scope.$destroy();
            });
            
            it("adding a stream", function () {
	            
	            scope.data.stream2 = {
		            value: 5,
		            ATTR_name: "stream2",
					name: "stream2",
					id: "stream2",
					UNITS: "ms",
					onChange: function () {
						return function () { };
					}
	            };

                scope.enabled_streams.push(scope.data.stream2);
	            
	            expect(scope.getSmoothie().seriesSet.length).toBe(0);
	            
	            scope.$digest();

	            expect(scope.getSmoothie().seriesSet.length).toBe(1);
	            
            });
            
            it("removing a stream", function () {
	            
	            scope.data.stream2 = {
		            value: 5,
		            ATTR_name: "stream2",
					name: "stream2",
					id: "stream2",
					UNITS: "ms",
					onChange: function () {
						return function () { };
					}
	            };

                scope.enabled_streams.push(scope.data.stream2);
	            
	            expect(scope.getSmoothie().seriesSet.length).toBe(0);
	            
	            scope.$digest();
	            
	            expect(scope.getSmoothie().seriesSet.length).toBe(1);

				scope.enabled_streams.splice(scope.enabled_streams.indexOf(scope.data.stream2), 1);
	            
	            scope.$digest();
	            
	            expect(scope.getSmoothie().seriesSet.length).toBe(0);
	            
            });
            
            it("adding multiple streams", function () {
	            
	            expect(scope.getSmoothie().seriesSet.length).toBe(0);
	            
	            for (var i = 0; i < 10; i++) {
		        	scope.data["stream" + i] = {
			            value: i * 2,
			            ATTR_name: "stream" + i,
						name: "stream" + i,
						id: "stream" + i,
						UNITS: "ms",
						onChange: function () {
							return function () { };
						}
		            };
                    scope.enabled_streams.push(scope.data["stream" + i]);
	            }
	            
	            scope.$digest();
	            
	            expect(scope.getSmoothie().seriesSet.length).toBe(10);
            });
            
            it("removing multiple streams", function () {
	            
	            expect(scope.getSmoothie().seriesSet.length).toBe(0);
	            
	            for (var i = 0; i < 10; i++) {
		        	scope.data["stream" + i] = {
			            value: i * 2,
			            ATTR_name: "stream" + i,
						name: "stream" + i,
						id: "stream" + i,
						UNITS: "ms",
						onChange: function () {
							return function () { };
						}
		            };
                    scope.enabled_streams.push(scope.data["stream" + i]);
	            }
	            
	            scope.$digest();
	            
	            expect(scope.getSmoothie().seriesSet.length).toBe(10);
	            
				for (i = 0; i < 10; i++) {
					delete scope.data["stream" + i];
                    scope.enabled_streams.splice(scope.enabled_streams.indexOf(scope.data["stream" + i]), 1);
				}
	            
	            scope.$digest();

				expect(scope.getSmoothie().seriesSet.length).toBe(0);
	            
            });
            
            it("handles disabled streams", function () {
	           
	           scope.data.stream = {
		            value: 5,
		            ATTR_name: "stream",
					name: "stream",
					id: "stream",
					UNITS: "ms",
				   onChange: function () {
					   return function () { };
				   }
	            };
	            
	            expect(scope.getSmoothie().seriesSet.length).toBe(0);

				scope.enabled_streams.push(scope.data.stream);

	            scope.$digest();
	            
	            expect(scope.getSmoothie().seriesSet.length).toBe(1);

				scope.enabled_streams.splice(scope.enabled_streams.indexOf(scope.data.stream), 1);
	            
	            scope.$digest();
	            
	            expect(scope.getSmoothie().seriesSet.length).toBe(0);

				scope.enabled_streams.push(scope.data.stream);
	            
	            scope.$digest();
	            
	            expect(scope.getSmoothie().seriesSet.length).toBe(1);
	            
            });
            
            it("updates streams with latest available values", function() {

				function setupCallback(callback) {
					return function (value) {
						callback(value);
					};
				}

				var doCallback;

	            scope.data.stream = {
		            value: 5,
		            ATTR_name: "stream",
					name: "stream",
					id: "stream",
					UNITS: "ms",
					onChange: function (callback) {
						doCallback = setupCallback(callback);
						doCallback(5);
						return function () { };
					}
	            };

				var smoothie = scope.getSmoothie();

                scope.enabled_streams.push(scope.data.stream);

				scope.$digest();

				var series = smoothie.seriesSet[0].timeSeries;
	            
	            expect(series.data[series.data.length - 1][1]).toBe(5);
	            
				doCallback(10);
	            
	            scope.$digest();

	            expect(series.data[series.data.length - 1][1]).toBe(10);
            });
            
        });
        
    });
    
}());