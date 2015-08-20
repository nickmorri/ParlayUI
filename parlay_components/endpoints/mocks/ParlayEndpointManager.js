angular.module('mock.parlay.endpoints.manager', []).factory('ParlayEndpointManager', ['$q', function ($q) {
    return {
		getActiveEndpoints: function () {
			return [];
		},
		requestDiscovery: function () {},
		activateEndpoint: function(endpoint) {},
		hasActiveEndpoints: function () {
			return false;
		},
		getAvailableEndpoints: function(query) {
			return [
		    	{
		        	matchesQuery: function () {
		            	return true;
		        	}
		    	},
		    	{
		        	matchesQuery: function () {
		            	return true;
		        	}
		    	},
		    	{
		        	matchesQuery: function () {
		            	return false;
		        	}
		    	}
			];
		},
		reorder: function(index, distance) {
			//
		},
		duplicateEndpoint: function (index) {
			//
		},
		deactivateEndpoint: function (index) {
			//
		}
	};
}]);