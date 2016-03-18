angular
.module('mainApp')
.service('gameplayService', ['$rootScope', 'physicsService', 'weaponService', function($rootScope, physicsService, weaponService) {

  var stateChangeFunc = (newState) => {console.log('placeholder state change func')}; // Placeholder

  class EntityManager {
    constructor (systems, entities) {
      if (entities) {
        this.entities = entities;
      } else {
        this.entities = {};
        this.maxId = 0;
      }

      this.delta_time = 0;
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

      let time = Date.now();

      if ( this.last_time ){
        this.delta_time = time - this.last_time;
      }

      this.last_time = time;

      for (let system of this.systems) {
        system(this);
      }
    }
  }

  function playerShipFactory(position, scene, mesh, camera, weapons, data) {
    return {
      'position': {'x': position.x, 'y': position.y},
      'weapons': weapons,
      'camera': camera,
      'model': mesh,
      'input': true,
      'direction': 0,
      'velocity': {'x': 0, 'y': 0},
      'direction_delta': 0,
      'data': data
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
            entity.direction_delta = 0;
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
            physicsService.accelerate(entity.velocity,
                                      entity.direction,
                                      entity.data.accel * entMan.delta_time)
          }
        }
        if ('input' in entity && 'direction' in entity) {
          let angle = entity.data.rotation * entMan.delta_time;

          if (inputStates.left) {
            physicsService.rotate(entity, angle);
            entity.direction_delta = -1 * angle;
          }
          else if (inputStates.right) {
            physicsService.rotate(entity, -1 * angle );
            entity.direction_delta = angle;
          }
          else {
            entity.direction_delta = 0;
          }
        }
        if ('input' in entity && 'weapons' in entity && inputStates.shoot) {
          entity.weapons.tryShoot(entMan, entity);
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

      var spriteManagerBullet = new BABYLON.SpriteManager(
          "bulletMgr", "assets/redblast.png", 1000,108, scene);

      let playerWeapon = new weaponService.Weapon(500, spriteManagerBullet)

      let camera = new BABYLON.FreeCamera(
          "camera1", new BABYLON.Vector3(0, -1, -10), scene)

      let playerData = {
        'accel': 0.00005,
        'rotation': 0.005
      }

      BABYLON.SceneLoader.ImportMesh("", "assets/","star_cruiser_1.babylon",
                                     scene, function(newMesh){
        newMesh[0].rotate(BABYLON.Axis.Y, -Math.PI/2, BABYLON.Space.LOCAL)
        entMan.insert(playerShipFactory({'x': 0, 'y':-1, 'z': -2}, scene,
                                        newMesh[0], camera, playerWeapon,
                                        playerData));
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
