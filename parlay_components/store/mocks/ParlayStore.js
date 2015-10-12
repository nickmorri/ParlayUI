function ParlayStore() {
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
}

angular.module('mock.parlay.store', []).factory('ParlayStore', ParlayStore);