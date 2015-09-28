function PromenadeStandardEndpointCardGraphTabController($scope, $mdDialog, $interval) {
	ParlayBaseTabController.call(this, $scope);
	
	this.chart_config = {
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
    
    $interval(function () {
        
        Object.keys(this.data).forEach(function (key) {
	        this.data[key].value = Math.floor(Math.random() > 0.5 ? this.data[key].value + 100 : this.data[key].value - 100);
        }.bind(this));
        
    }.bind(this), 1000);
    
    this.data = {};
    
    for (var i = 1; i < 11; i++) {
        this.data["line" + i] = {
	      	value: 10 * i,
	      	config: {
		  		lineWidth: 2
	      	},
	      	enabled: true
        };
    }
	
	this.openConfigurationDialog = function($event) {
		$mdDialog.show({
			controller: "PromenadeStandardEndpointCardGraphTabConfigurationController",
			controllerAs: "ctrl",
			locals: {
				data: this.data
			},
			bindToController: true,
			templateUrl: "../vendor_components/promenade/endpoints/directives/promenade-standard-endpoint-card-graph-configuration-dialog.html",
			targetEvent: $event,
			clickOutsideToClose: true
		});
	};
	
}

PromenadeStandardEndpointCardGraphTabController.prototype = Object.create(ParlayBaseTabController.prototype);

PromenadeStandardEndpointCardGraphTabController.prototype.lineCount = function() {
	return Object.keys(this.data).filter(function (key) {
    	return this.data[key].enabled;
	}.bind(this)).length;
};

function PromenadeStandardEndpointCardGraphTabConfigurationController($mdDialog, data) {
	this.hide = $mdDialog.cancel;
}

PromenadeStandardEndpointCardGraphTabConfigurationController.prototype.removeLine = function (name) {
	delete this.data[name];
};

function PromenadeStandardEndpointCardGraph() {
	return {
        scope: {
            endpoint: "="
        },
        templateUrl: '../vendor_components/promenade/endpoints/directives/promenade-standard-endpoint-card-graph.html',
        controller: "PromenadeStandardEndpointCardGraphTabController",
		controllerAs: "ctrl",
		bindToController: true
    };
}

angular.module('promenade.endpoints.standardendpoint.graph', ["promenade.smoothiechart"])
	.controller("PromenadeStandardEndpointCardGraphTabController", ["$scope", "$mdDialog", '$interval', PromenadeStandardEndpointCardGraphTabController])
	.controller("PromenadeStandardEndpointCardGraphTabConfigurationController", ["$mdDialog", "data", PromenadeStandardEndpointCardGraphTabConfigurationController])
	.directive('promenadeStandardEndpointCardGraph', PromenadeStandardEndpointCardGraph);