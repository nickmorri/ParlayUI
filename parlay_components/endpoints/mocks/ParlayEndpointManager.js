angular.module('mock.parlay.endpoints.manager', []).factory('ParlayEndpointManager', ['$q', function ($q) {
    return {
		getActiveEndpoints: function () {
			return [];
		},
		requestDiscovery: function () {},
		activateEndpoint: function(endpoint) {},
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
		}
	};
}]);