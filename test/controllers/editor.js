describe('parlay.editor', function() {
    
    beforeEach(module('parlay.editor'));
    
	describe('editorController', function () {
		var scope, controller;

		beforeEach(inject(function($rootScope, $controller) {
			scope = $rootScope.$new();
			endpointController = $controller('editorController', {$scope: scope});
		}));

		describe('ace editor', function () {

			it('initialization', function () {
				expect(scope.editor.file.name).toBeUndefined();
				expect(scope.editor.file.data).toBe("");
				expect(scope.editor.saved).toBeTruthy();
			});

			it('isDifferent check', function () {
				expect(scope.editor.file.data).toBe("");
				expect(scope.editor.isDifferent()).toBeFalsy();
			});

			it('saves', function () {
				scope.open();
				expect(scope.editor.saved).toBeFalsy();
				scope.save();
				expect(scope.editor.saved).toBeFalsy();
			});

			it('loads', function () {
				scope.save();
				expect(scope.editor.saved).toBeTruthy();
				scope.open();
				expect(scope.editor.saved).toBeFalsy();
			});

		});

	});
    
});