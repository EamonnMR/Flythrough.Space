angular
.module('mainApp')
.service('gameplayService', ['$rootScope', 'physicsService', function($rootScope, physicsService) {

  var stateChangeFunc = (newState) => {console.log('placeholder state change func')}; // Placeholder

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

  function playerShipFactory(position, scene, mesh, camera) {
    return {
      'position': {'x': position.x, 'y': position.y},
      'camera': camera,
      'model': mesh,
      'input': true,
      'direction': 0,
      'velocity': {'x': 0, 'y': 0},
      'direction_delta': 0
    }
  }

  function planetFactory (position, size, sprite) {
    sprite.position.x = position.x;
    sprite.position.y = position.y;
    sprite.position.z = position.z;
    return {
      'position': {'x': position.x, 'y': position.y},
      'model': sprite
    };
  }

  function cameraFollowSystem (entMan) {
    for (let id in entMan.entities) {
      if (entMan.entities.hasOwnProperty(id)) {
        let entity = entMan.entities[id];
        if ('position' in entity && 'camera' in entity) {
          entity.camera.position.x = entity.position.x;
          entity.camera.position.y = entity.position.y;
        }
      }
    }
  };

  function modelPositionSystem (entMan) {
    for (let id in entMan.entities) {
      if (entMan.entities.hasOwnProperty(id)) {
        let entity = entMan.entities[id];
        if ('model' in entity) {
          if ('position' in entity) {
            entity.model.position.x = entity.position.x;
            entity.model.position.y = entity.position.y;
          }
          if ('direction' in entity) {
            entity.model.rotate(BABYLON.Axis.Y, entity.direction_delta, BABYLON.Space.LOCAL)
          }
        }
      }
    }
  };

  function inputSystem (entMan) {
    for (let id in entMan.entities) {
      if (entMan.entities.hasOwnProperty(id)) {
        let entity = entMan.entities[id];
        if ('input' in entity && 'velocity' in entity) {
          if (inputStates.forward) {
            physicsService.accelerate(entity.velocity, entity.direction, 0.05)
          }
        }
        if ('input' in entity && 'direction' in entity) {
          if (inputStates.left) {
            physicsService.rotate(entity, 0.05);
            entity.direction_delta = -0.05;
          }
          else if (inputStates.right) {
            physicsService.rotate(entity, -0.05);
            entity.direction_delta = 0.05;
          }
          else {
            entity.direction_delta = 0;
          }
        }
        if ('input' in entity && 'weapons' in entity && inputStates.shoot) {
          weaponsService.tryShoot(entMan, entity);
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

  function setupGameplayRender (gameCanvas) {
    var engine = new BABYLON.Engine(gameCanvas, true);
    var entMan = new EntityManager([
      inputSystem,
      physicsService.velocitySystem,
      physicsService.speedLimitSystem,
      modelPositionSystem,
      cameraFollowSystem,
    ]);
    function createScene () {
      var scene = new BABYLON.Scene(engine);

      scene.clearColor = new BABYLON.Color3(0, 0, 0);


      var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
      light.intensity = .5;

      var spriteManagerPlanet = new BABYLON.SpriteManager(
          "planetMgr", "assets/renderwahn_planets/A00.png", 10, 122, scene);
      var planetSprite = new BABYLON.Sprite("planet", spriteManagerPlanet);
      entMan.insert(planetFactory({'x':0, 'y':1, 'z': 10}, 2, planetSprite));

      let camera = new BABYLON.FreeCamera(
          "camera1", new BABYLON.Vector3(0, -1, -10), scene)

      BABYLON.SceneLoader.ImportMesh("", "assets/","star_cruiser_1.babylon",
                                     scene, function(newMesh){
        console.log(newMesh);
        console.log(newMesh[0])
        console.log(newMesh[0].position)
        newMesh[0].rotate(BABYLON.Axis.Y, -Math.PI/2, BABYLON.Space.LOCAL)
        entMan.insert(playerShipFactory({'x': 0, 'y':-1, 'z': -2}, scene,
                                        newMesh[0], camera));
      });

      return scene;
    }

    var scene = createScene();

    window.addEventListener("resize", function () {
      engine.resize();
    });


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
      case 27: // escape
        stateChangeFunc('menu');
        break;
    }
  };

  $(document).keydown( handleKeyDown );
  $(document).keyup( handleKeyUp );

  return {
    setupGameplayRender: setupGameplayRender,
    registerStateChangeFunction: (stateChange) => {
      stateChangeFunc = stateChange;
    }
  }
}])
