/**
 * @name EditorConfiguration
 * @param $stateProvider - Service provided by ui.router
 * @description - The EditorConfiguration sets up the items state.
 */
function EditorConfiguration($stateProvider) {
    $stateProvider.state("editor", {
        url: "/editor",
        templateUrl: "../parlay_components/editor/views/base.html",
        controller: "ParlayEditorController",
        controllerAs: "editorCtrl"
    });
}

function EditorDialogController($scope, $mdDialog, $mdMedia, click) {

    $scope.click = click;

    this.hide = function () {
        $mdDialog.hide($scope.click);
    };

    $scope.$mdMedia = $mdMedia;

}

function ParlayEditorController($scope, $mdDialog) {

    $scope.items = [];
    
    this.edit = function (item) {
        $mdDialog.show({
            controller: "EditorDialogController",
            controllerAs: "ctrl",
            templateUrl: "../parlay_components/editor/directives/editor-dialog.html",
            locals: { "click": item.click.toString() }
        }).then(function (result) {
            item.click = eval("(" + result + ")");
        });
    };
    
    this.add = function (item) {
        $scope.items.push({name: item, icon: item, click: function () {
            alert("hey");
        }});
    };
    
}

angular.module("parlay.editor", ["ui.router", "ui.ace"])
    .controller("ParlayEditorController", ["$scope", "$mdDialog", "$mdToast", "$mdMedia", ParlayEditorController])
    .controller("EditorDialogController", ["$scope", "$mdDialog", "$mdMedia", "click", EditorDialogController])
    .config(["$stateProvider", EditorConfiguration])
    .directive('ngRightClick', function($parse) {
        return function(scope, element, attrs) {
            var fn = $parse(attrs.ngRightClick);
            element.bind('contextmenu', function(event) {
                scope.$apply(function() {
                    event.preventDefault();
                    fn(scope, {$event:event});
                });
            });
        };
    });