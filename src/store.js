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
      this.SYSTEM_RADIUS = 4;
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

      var systems = this.data.systems;

      for (let sysName in systems) {
        if (systems.hasOwnProperty(sysName)) {
          let system = systems[sysName];

          // Select color based on government
          this.drawCircle(system.x, system.y, this.SYSTEM_RADIUS, 'White')
        }
      }
    }

    drawCircle(x, y, radius, color) {
      var saveStroke = this.context.strokeStyle;
      this.context.beginPath();
      this.context.arc(x, y, radius, 0, 2 * Math.PI, false);
      this.context.strokeStyle = color;
      this.context.fill();
      this.context.stroke();
      this.context.strokeStyle = saveStroke;
    };

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
