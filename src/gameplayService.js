angular
.module('mainApp')
.service('gameplayService', ['$rootScope',
                             'physicsService',
                             'weaponService',
                             'ecsService',
                             'inputService',
                             function($rootScope,
                                      physicsService,
                                      weaponService,
                                      ecsService,
                                      inputService) {

  var stateChangeFunc = (newState) => {console.log('placeholder state change func')}; // Placeholder

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

  function setupGameplayRender (gameCanvas) {
    var engine = new BABYLON.Engine(gameCanvas, true);
    var entMan = new ecsService.EntityManager([
      inputService.inputSystem,
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

    inputService.bindInputFunctions();


    engine.runRenderLoop(function () {
      scene.render();
      entMan.update();
    });
  }

  return {
    setupGameplayRender: setupGameplayRender,
    registerStateChangeFunction: (stateChange) => {
      stateChangeFunc = stateChange;
    }
  }
}])
