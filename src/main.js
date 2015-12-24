var app = angular.module('mainApp', []);
app.controller('mainController', [
  '$scope',
  '$http',
  'serviceName',
  function(
    $scope,
    $http,
    mapService
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
  };

  function velocitySystem( object){
    let dt = .05; //How do we get delta time from the engine?
    for (let id in entMan.entities) {
      if (entMan.entities.hasOwnProperty(id)) {
        let entity = entMan.entities[id];
        if ('velocity' in entity
            && 'position' in entity) {
          	object.position.x += object.velocity.x * dt;
          	object.position.y += object.velocity.y * dt;
        }
      }
    }
  };

  function speedLimitSystem(entMan) {
    for (let id in entMan.entities) {
      if (entMan.entities.hasOwnProperty(id)) {
        let entity = entMan.entities[id];
        if ('velocity' in entity
            && 'position' in entity
            && 'maxSpeed') {
        	let dir = Math.atan2(entity.velocity.x, entity.velocity.y);
        	if(
              Math.sqrt( Math.pow(entity.velocity.x, 2)
              + Math.pow(entity.velocity.x) )
              > entity.maxSpeed ){
        		entity.velocity = Math.cos(dir) * entity.maxSpeed;
        		entity.velocity = Math.sin(dir) * entity.maxSpeed;
        	}
        }
      }
    }
  };


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
}]);
