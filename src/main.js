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
      console.log('ng mouseup')
    }

    mouseDown($event) {
      this.dragging = true;
      console.log('ng mousdown')
    }

    mouseMove($event) {
      if (this.dragging) {
        this.offset = {
          'x': this.offset.x -= this.move.x - $event.clientX,
          'y': this.offset.y -= this.move.y - $event.clientY,
        }
        this.draw();
      }
      this.move = {'x': $event.clientX, 'y': $event.clientY}
      console.log('ng mousemove')
    }

    draw(){
      this.context.fillStyle = "Black";
      this.context.fillRect(0, 0, 851, 600);

      var systems = this.data.systems;

      //Draw each system connection line
      this.context.strokeStyle = "gray";
      for (var sysName in systems) {
        if (systems.hasOwnProperty(sysName)) {
          let system = systems[sysName];
          for (var linkName in system.links) {
            if (system.links.hasOwnProperty(linkName)) {
              let link = system.links[linkName];
              //FIXME: This should be normalized - only one copy of a link
              // should exist.
              if (link in systems) {
                let target = systems[link];
                this.context.beginPath();
                //Not sure if its faster to do a new context for each line or not-
                //further research is needed
                this.context.moveTo(system.x + this.offset.x,
                               system.y + this.offset.y);
                this.context.lineTo(target.x + this.offset.x,
                               target.y + this.offset.y);
                this.context.stroke();
              } //else {
                //console.log('Bad link: ' + link);
              //}
            }
          }
        }
      }

      for (let sysName in systems) {
        if (systems.hasOwnProperty(sysName)) {
          let system = systems[sysName];
          // Select color based on government
          this.drawCircle(system.x + this.offset.x,
                          system.y + this.offset.y,
                          this.SYSTEM_RADIUS,
                          'govt' in system ?
                            this.data.govts[system.govt].color
                            : 'Gray');
        }
      }

      this.context.fillStyle = 'White';
      for (let sysName in systems) {
        if (systems.hasOwnProperty(sysName)) {
          let system = systems[sysName];
          this.context.fillText(sysName, system.x + this.offset.x + 4,
                                         system.y + this.offset.y + 3);
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
                               $('#mapcanvas')[0].getContext('2d',
                                  { antialias: true}));
          console.log('Downloaded the map')
          $scope.map.draw();
        });

  class EntityManager {
    constructor (systems, entities) {
      if (entities) {
        this.entities = entities;
      } else {
        this.entities = {};
        this.maxId = 0;
      }

      this.systems = systems;
    }

    get (id) {
      if (id in this.entities) {
        return this.entities[id];
      } else {
        return null;
      }
    }

    insert (entity) {
      this.maxId ++;
      this.entities[this.maxId] = entity;
      entity.id = this.maxId;
      return this.maxId;
    }

    update () {
      for (let system of this.systems) {
        system(this);
      }
    }
  }

  function playerShipFactory(position, scene) {
    let sphere = BABYLON.Mesh.CreateSphere("sphere", 16, 3, scene);
    sphere.position.x = position.x;
    sphere.position.y = position.y;
    sphere.position.z = position.z;
    return {

      'position': {'x': position.x, 'y': position.y},
      'camera': new BABYLON.FreeCamera(
          "camera1", new BABYLON.Vector3(position.x, position.y, -10), scene),
      'model': sphere,
      'input': true
    }
  }

  function planetFactory (position, size, scene) {
    let sphere = BABYLON.Mesh.CreateSphere("sphere", 16, size, scene);
    sphere.position.x = position.x;
    sphere.position.y = position.y;
    sphere.position.z = position.z;
    return {
      'position': {'x': position.x, 'y': position.y},
      'model': sphere
    };
  }

  function cameraFollowSystem (entMan) {
    for (let id in entMan.entities) {
      if (entMan.entities.hasOwnProperty(id)) {
        let entity = entMan.entities[id];
        if ('position' in entity && 'camera' in entity) {
          entity.camera.position.x = entity.position.x;
          entity.camera.position.y = entity.position.y;
          entity.model.position.x = entity.position.x;
          entity.model.position.y = entity.position.y;
        }
      }
    }
  };

  function inputSystem (entMan) {
    for (let id in entMan.entities) {
      if (entMan.entities.hasOwnProperty(id)) {
        let entity = entMan.entities[id];
        if ('input' in entity && 'position' in entity) {
          if (inputStates.forward) {
            entity.position.y += .01;
          }
        }
      }
    }
  };

  function deletionSystem (entMan) {
    let deleteList = [];
    for (let id in entMan.entities) {
      if (entMan.entities.hasOwnProperty(id)) {
        if ('remove' in entMan.get(id)) {
          deleteList.push(id)
        }
      }
    }
    for (let id of deleteList) {
      delete entMan.entities[id];
    }

  }

  function setupGameplayRender () {
    var engine = new BABYLON.Engine($('#gameCanvas')[0], true);
    var entMan = new EntityManager([inputSystem, cameraFollowSystem, ]);
    function createScene () {
      var scene = new BABYLON.Scene(engine);

      scene.clearColor = new BABYLON.Color3(0, 0, 0);


      var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
      light.intensity = .5;

      entMan.insert(planetFactory({'x':0, 'y':1, 'z': 0}, 2, scene));

      entMan.insert(playerShipFactory({'x': 0, 'y':-1, 'z': -2}, scene));

      return scene;
    }

    var scene = createScene();

    engine.runRenderLoop(function () {
      scene.render();
      entMan.update();
    });
  }

  var inputStates = {
    'forward': false,
    'left': false,
    'right': false,
    'shoot': false
  };

  function handleKeyDown ( event ){
    switch(event.keyCode){
      case 38:
        inputStates.forward = true;
        break;
      case 37:
        inputStates.left = true;
        break;
      case 39:
        inputStates.right = true;
        break;
      case 17:
        inputStates.shoot = true;
        break;
    }
  };

  function handleKeyUp ( event ){
    switch(event.keyCode){
      case 38:
        inputStates.forward = false;
        break;
      case 37:
        inputStates.left = false;
        break;
      case 39:
        inputStates.right = false;
        break;
      case 17:
        inputStates.shoot = false;
        break;
    }
  };

  $(document).keydown( handleKeyDown );
  $(document).keyup( handleKeyUp );


  setupGameplayRender();
});
