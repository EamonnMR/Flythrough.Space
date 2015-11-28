var app = angular.module('storeApp', []);
app.controller('storeController', function($scope, $http) {
  $scope.firstName = "John";
  $scope.lastName = "Doe";
  $scope.view_state = "menu"
  $scope.enterState = (state) => {
    $scope.view_state = state;
  };

  class MapView {
    constructor(data, location, drawContext) {
      this.offset = location;
      this.move = {'x': 0, 'y': 0};
      this.map_size = {'x': 0, 'y': 0};
      this.data = data;
      this.context = drawContext;
      this.dragging = false;
    }

    mouseUp($event) {
      this.dragging = false;
      console.log('MouseUp');
    }

    mouseDown($event) {
      this.dragging = true;
      console.log('mouseDown')
    }

    mouseMove($event) {
      if (this.dragging) {
        console.log("Dragging map")
        this.draw();
      }
    }

    draw(){
      this.context.fillStyle = "Black";
      this.context.fillRect(0, 0, 851, 600);
    }
  };
  $http.get('data/systems.json')
       .then(function(res){
          $scope.map = new MapView(res.data,
                               {'x': 0, 'y': 0},
                               $('#mapcanvas')[0].getContext('2d'));
          console.log('Downloaded the map')
          $scope.map.draw();
        });
});
