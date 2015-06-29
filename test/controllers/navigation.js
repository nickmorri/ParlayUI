"use strict";

describe('parlay.navigation', function() {
    
    beforeEach(module('parlay.navigation'), module('ngMaterial'));
    
    describe('parlayNavToggleOpen', function () {
        
        it ('defaults open', inject(function ($injector) {
            expect($injector.get('parlayNavToggleOpen')).toBeTruthy();
        }));
    });
    
	describe('parlayToolbarController', function () {
		var scope, parlayToolbarController;

		beforeEach(inject(function($rootScope, $controller) {
			scope = $rootScope.$new();
			parlayToolbarController = $controller('parlayToolbarController', {$scope: scope});
		}));
		
		describe('toggle nav menu', function () {
    		it('toggles', inject(function ($mdMedia) {
        		expect(scope.parlayNavToggleOpen).toBe($mdMedia('gt-md'));
        		scope.toggleMenu();
        		expect(scope.parlayNavToggleOpen).toBe(!$mdMedia('gt-md'));
    		}));
		});

	});
	
	describe('parlayNavController', function () {
		var scope, parlayNavController;
		
		beforeEach(inject(function($rootScope, $controller) {
			scope = $rootScope.$new();
			parlayNavController = $controller('parlayNavController', {$scope: scope, $state: {
        		get: function () {
        		    return [{name: 'editor'}, {name:'settings'}];
    		    }
            }});
		}));
		
		describe('fetches icon for', function () {
    		
    		it('endpoints', function () {
        		expect(scope.fetchIcon('endpoints')).toBe('extension');
    		});
    		
    		it('editor', function () {
        		expect(scope.fetchIcon('editor')).toBe('create');
    		});
    		
    		it('console', function () {
        		expect(scope.fetchIcon('console')).toBe('message');
    		});
    		
    		it('non existant state', function () {
        		expect(scope.fetchIcon('NULL')).toBe('')
    		});
    		
		});
		
		it('builds nav menu from states', function () {
    		expect(scope.states).toEqual([{name:"editor", route:"editor", icon:"create"}]);
		});

	});
    
});