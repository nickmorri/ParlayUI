/**
 * Convenience class with useful methods that can be injected throughout Parlay.
 * @constructor
 */
function ParlayError() {
	
	var status = {
		ok: ["INFO", "OK", "ACK"],
		warning: ["WARNING"],
		error: ["ERROR"]
	};
	
	this.isStatusOk = function (code) {
		return status.ok.indexOf(code) > -1;
	};
	
	this.isStatusError = function (code) {
		return status.error.indexOf(code) > -1;
	};
	
	this.isStatusWarning = function (code) {
		return status.warning.indexOf(code) > -1;
	};
	
}

function ParlayErrorFactory() {
	return new ParlayError();
}

angular.module('parlay.error', [])
	.factory('ParlayError', ParlayErrorFactory);