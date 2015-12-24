var app = angular.module('mainApp', []);
app.controller('mainController', [
  '$scope',
  '$http',
  'mapService',
  'gameplayService',
  function(
    $scope,
    $http,
    mapService,
    gameplayService
  ) {

  $scope.view_state = "menu"
  $scope.enterState = (state) => {
    $scope.view_state = state;
  };

  $http.get('data/systems.json')
       .then(function(res){
          $scope.map = new mapService.MapView(res.data,
                               {'x': 0, 'y': 0},
                               $('#mapcanvas')[0].getContext('2d',
                                  { antialias: true}));
          console.log('Downloaded the map')
          $scope.map.draw();
        });

  gameplayService.setupGameplayRender($('#gameCanvas')[0]);
}]);
