var navigation = angular.module('parlay.navigation', ['parlay.socket']);

navigation.value('parlayNavToggleOpen', true);

navigation.directive('parlayToolbar', function () {
    return {
        templateUrl: 'parlay_components/navigation/directives/parlay-toolbar.html',
        controller: ['$scope', '$mdSidenav', '$mdMedia', 'parlayNavToggleOpen', 'ParlaySocket', function ($scope, $mdSidenav, $mdMedia, parlayNavToggleOpen, ParlaySocket) {
            
            $scope.socket = ParlaySocket;
            
            // If we are on a screen size greater than the medium layout breakpoint we should open the navigation menu by default
            $scope.parlayNavToggleOpen = $mdMedia('gt-md');
            
            // Toggle the boolean holding the navigation menu open
            $scope.toggleMenu = function () {
                $scope.parlayNavToggleOpen = !$scope.parlayNavToggleOpen;
            };
            
            $scope.disconnect = function () {
                $scope.socket.close();
            };
            
            $scope.connect = function () {
                $scope.socket.open();
            };
            
            // If the media query for greater than medium screen size breakpoint is false we should collapse the menu
            $scope.$watch(function () {
                return $mdMedia('gt-md');
            }, function (value) {
                if (!value && $mdSidenav('parlayNavMenu').isLockedOpen()) $scope.toggleMenu();
            });
        }]
    };
});

navigation.directive('parlayNav', function () {
    return {
        templateUrl: 'parlay_components/navigation/directives/parlay-navigation.html',
        replace: true,
        controller: function ($scope, $state, $rootScope, parlayNavToggleOpen) {
            
            $scope.parlayNavToggleOpen = parlayNavToggleOpen;
            
            // Will be set to true after first successful state change
            $scope.initialStateChange = false;
            
            // Default icons
            $scope.fetchIcon = function (state) {
                var icons = {
                    'endpoints': 'extension',
                    'editor': 'create',
                    'console': 'message'
                };
                
                try {
                    return icons[state];
                } catch (e) {
                    return '';
                }
            };
            
            // Retrieve and format state information to build navigation elements
            $scope.buildNavFromStates = function () {
                var excluded = ['settings', 'help'];
                return $state.get().filter(function (state) {
                    return !state.abstract && excluded.indexOf(state.name) == -1;
                }).map(function (state) {
                    return {
                        name: state.name,
                        route: state.name,
                        icon: $scope.fetchIcon(state.name)
                    };
                });
            };
            
            // Retrieve states so we can dynamically build navigation menu
            $scope.states = $scope.buildNavFromStates();
            
            // Close navigation menu after successful state change
            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                if (!$scope.initialStateChange) {
                    $scope.initialStateChange = true;
                    return;
                }
                
                $scope.parlayNavToggleOpen = false;
            });
        }
    };
});