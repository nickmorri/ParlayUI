var editor = angular.module('parlay.editor', ['ui.ace', 'ngMaterial', 'ngMdIcons']);

editor.controller('editorController', ['$scope', '$window', function ($scope, $window) {
    
    // Container for editor file data and configuration options
    $scope.editor = {
        file: {
            name: undefined,
            data: ''
        },
        options: {
            mode: 'python',
            onLoad: function (_editor) {
                $scope.editor.undoManager = _editor.session.$undoManager;                
            },
            onChange: function (event) {
                $scope.editor.saved = $scope.editor.isDifferent();
            }
        },
        saved: true,
        isDifferent: function () {
            return this.file.data.length !== 0;
        }
    };
    
    $scope.save = function () {
        $scope.editor.saved = true;
    };
    
    $scope.open = function () {
        $scope.editor.saved = false;
    };
    
}]);

editor.directive('parlayEditorToolbar', function () {
    return {
        templateUrl: 'parlay_components/editor/directives/parlay-editor-toolbar.html'
    };
});

// File upload button directive
editor.directive('parlayFileUpload', function () {
    return {
        scope: {
            file: '='
        },
        link: function (scope, element, attributes) {
            element.bind('change', function (event) {
                scope.file.name = event.target.files[0].name;
                
                // Instantiate FileReader object 
                var fileReader = new FileReader();
                fileReader.onload = function (event) {
                    // When file is loaded apply it to the Angular scope
                    scope.$apply(function () {
                        scope.file.data = event.target.result;
                    });
                };
                
                // Read file as ArrayBuffer data type
                fileReader.readAsText(event.target.files[0]);
            });
        }
    };
});