var app = angular.module('storeApp', []);
app.controller('storeController', function($scope) {
   $scope.firstName = "John";
   $scope.lastName = "Doe";
   $scope.view_state = "menu"
   $scope.enterState = (state) => {
     $scope.view_state = state
   };
});
