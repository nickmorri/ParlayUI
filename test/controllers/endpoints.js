"use strict";

describe('parlay.endpoints', function() {
    
    beforeEach(module('parlay.endpoints'));
    
	describe('endpointController', function () {
		var scope, endpointController;

		beforeEach(inject(function($rootScope, $controller) {
			scope = $rootScope.$new();
			endpointController = $controller('endpointController', {$scope: scope});
		}));

		describe('search state', function () {

			it('initilization', function () {
				expect(scope.isSearching).toBeFalsy();
			});

			it('toggle', function () {
				expect(scope.isSearching).toBeFalsy();
				scope.toggleSearch();
				expect(scope.isSearching).toBeTruthy();
				scope.toggleSearch();
				expect(scope.isSearching).toBeFalsy();
			});

		});

		describe('display mode', function () {

			it('initilization', function () {
				expect(scope.displayCards).toBeTruthy();
			});

		});

		describe('endpoint', function () {

			it ('setup', function (done) {
				expect(scope.endpointManager.active_endpoints.length).toBe(0);
				scope.setupEndpoint();
				expect(scope.endpointManager.active_endpoints.length).toBe(1);
				done();
			});

			it('disconnect', function (done) {
				expect(scope.endpointManager.active_endpoints.length).toBe(0);
				scope.setupEndpoint();
				expect(scope.endpointManager.active_endpoints.length).toBe(1);
				scope.disconnectEndpoint(0);
				expect(scope.endpointManager.active_endpoints.length).toBe(0);
				done();
			});

			it('reconnect', function () {
				scope.reconnectEndpoint(0);
				expect(scope.endpointManager.active_endpoints.length).toBe(1);
			});

		});

	});
    
});