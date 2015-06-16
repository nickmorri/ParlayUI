var editor = angular.module('parlay.editor', []);

devices.controller('editorCtrl', function ($scope, $log) {
    
    var $scope = $scope;
    $scope.simulateQuery = false;
    $scope.isDisabled    = false;
    // list of `state` value/display objects
    
    
    // ******************************
    // Internal methods
    // ******************************
    /**
     * Search for states... use $timeout to simulate
     * remote dataservice call.
     */
    $scope.querySearch = function (query) {
      var results = query ? $scope.states.filter( $scope.createFilterFor(query) ) : $scope.states,
          deferred;
      if ($scope.simulateQuery) {
        deferred = $q.defer();
        $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
        return deferred.promise;
      } else {
        return results;
      }
    }
    $scope.searchTextChange = function(text) {
      $log.info('Text changed to ' + text);
    }
    $scope.selectedItemChange = function(item) {
      $log.info('Item changed to ' + JSON.stringify(item));
    }
    /**
     * Build `states` list of key/value pairs
     */
    $scope.loadAll = function() {
      var allStates = 'test.txt, script.txt, file.txt, test.py, script.py, test.py';
      return allStates.split(/, +/g).map( function (state) {
        return {
          value: state.toLowerCase(),
          display: state
        };
      });
    }
    /**
     * Create filter function for a query string
     */
    $scope.createFilterFor = function(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(state) {
        return (state.value.indexOf(lowercaseQuery) === 0);
      };
    }
    
    $scope.states = $scope.loadAll();
    $scope.querySearch = $scope.querySearch;
    $scope.selectedItemChange = $scope.selectedItemChange;
    $scope.searchTextChange = $scope.searchTextChange;
    
});