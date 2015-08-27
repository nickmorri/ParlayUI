angular.module('mock.parlay.store', []).factory('ParlayStore', function () {
    return function (prefix) {
	    return {
		    clear: function () {},
		    packedValues: function () {
			    return [];
		    },
		    packItem: function () {},
		    unpackItem: function () {},
		    removePackedItem: function () {}
	    };
    };
});