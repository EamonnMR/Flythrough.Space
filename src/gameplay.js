import * as physics from "physics";
import * as weapon from "weapon";
import * as ecs from "ecs";
import * as input from "input";
import * as entities from "entities";
import * as collision from "collision";

export setupGameplayRender (gameCanvas) {
   engine = new BABYLON.Engine(gameCanvas, true);
  var entMan = new ecsService.EntityManager([
    inputService.inputSystem,
    physicsService.velocitySystem,
    physicsService.speedLimitSystem,
    entitiesService.modelPositionSystem,
    entitiesService.cameraFollowSystem,
    weaponService.weaponSystem,
    weaponService.decaySystem,
    collisionService.collisionDetectionSystem,
    ecsService.deletionSystem
  ]);

  function createScene () {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0, 0, 0);


    let light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = .5;

    let spriteManagerPlanet = new BABYLON.SpriteManager(
        "planetMgr", "assets/renderwahn_planets/A00.png", 10, 122, scene);
    let planetSprite = new BABYLON.Sprite("planet", spriteManagerPlanet);

    let spriteManagerAsteroid = new BABYLON.SpriteManager(
        "roidMgr", "assets/asteroid.png", 1000, 269, scene);

    let asteroidSprite = new BABYLON.Sprite("roid", spriteManagerAsteroid);

    entMan.insert(entitiesService.planetFactory({'x':0, 'y':1, 'z': 10}, 2,
                                                   planetSprite));
    entMan.insert(entitiesService.asteroidFactory({x: 3, y: 3}, 
          {x: -0.00008, y: -0.00008}, asteroidSprite));

    let spriteManagerBullet = new BABYLON.SpriteManager(
        "bulletMgr", "assets/redblast.png", 1000,16, scene);
      

    let playerWeapon = [new weaponService.Weapon(500, spriteManagerBullet)]

    let camera = new BABYLON.FreeCamera(
        "camera1", new BABYLON.Vector3(0, -1, -10), scene)

    let playerData = {
      'accel': 0.00005,
      'rotation': 0.005
    }

    BABYLON.SceneLoader.ImportMesh("", "assets/","star_cruiser_1.babylon",
                                     scene, function(newMesh){
      newMesh[0].rotate(BABYLON.Axis.Y, -Math.PI/2, BABYLON.Space.LOCAL)
      entMan.insert(entitiesService.playerShipFactory(
                                      {'x': 0, 'y':-1, 'z': -2}, scene,
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
};

$( setupGameplayRender( $('#gamecanvas') );

