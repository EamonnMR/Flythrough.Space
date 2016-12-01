import * as physics from "physics";
import * as weapon from "weapon";
import * as ecs from "ecs";
import * as input from "input";
import * as entities from "entities";
import * as collision from "collision";
import * as map from "map";


export function setupGameplayRender (gameCanvas, mapdata) {
  let engine = new BABYLON.Engine(gameCanvas[0], true);
  let entMan = new ecs.EntityManager([
    input.inputSystem,
    physics.velocitySystem,
    physics.speedLimitSystem,
    entities.modelPositionSystem,
    entities.cameraFollowSystem,
    weapon.weaponSystem,
    weapon.decaySystem,
    collision.collisionDetectionSystem,
    ecs.deletionSystem
  ]);


  let scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0, 0, 0);

  let camera = new BABYLON.FreeCamera(
        "camera1", new BABYLON.Vector3(0, -1, -10), scene)
  let world_models = setup_world(scene, camera, entMan);

  let map_view = null; // Only populated while game is paused

  let map_pos = {x: 0, y: 0};

  let current_system = "Casamance";

  let selected_system = current_system;

  window.addEventListener("resize", function () {
    engine.resize();
    if (map_view){
      // TODO: Refactor these
      let disposed = map_view.dispose(gameCanvas);
      map_view = new map.MapView(mapdata, disposed.position,
                                 scene, gameCanvas, disposed.selection );
    }
  });


  input.bindInputFunctions({
    'toggle_pause': function(){
      if ( entMan.paused ){
        entMan.unpause();
        let disposed = map_view.dispose(gameCanvas);
        map_view = null;
        selected_system = disposed.selection;
        map_pos = disposed.position;
      } else {
        entMan.pause();
        map_view = new map.MapView(mapdata, map_pos, scene,
                                   gameCanvas, selected_system);
      }
    },

    'reset_game': function() {
      entMan.clear();
      for (let world_model of world_models){
        world_model.dispose();
      }
      world_models = setup_world(scene, camera, entMan);
    }

  });

  engine.runRenderLoop(function () {
    scene.render();
    entMan.update();
  });
};


export function setup_world(scene, camera, entMan) {
  let lights = [
    {
      'name': 'sun',
      'pos': {x: 0, y: 1, z: 0},
      'intensity': .5
    }
  ]

  let spriteManagerAsteroid = new BABYLON.SpriteManager(
      "roidMgr", "assets/asteroid.png", 1000, 269, scene);

  let asteroidSprite = new BABYLON.Sprite("roid", spriteManagerAsteroid);
 
  let ents = [
    entities.asteroidFactory({x: 3, y: 3}, 
                             {x: -0.00008, y: -0.00008},
                             asteroidSprite)

  ]


  let spriteManagerPlanet = new BABYLON.SpriteManager(
      "planetMgr", "assets/renderwahn_planets/A00.png", 10, 122, scene);
  let planetSprite = new BABYLON.Sprite("planet", spriteManagerPlanet);


  let planets = [
    entities.planetFactory({x:0, y:1, z: 10}, 2, planetSprite)
  ]

  BABYLON.SceneLoader.ImportMesh("", "assets/","star_cruiser_1.babylon", 
      scene, function(newMesh){

    let spriteManagerBullet = new BABYLON.SpriteManager(
        "bulletMgr", "assets/redblast.png", 1000,16, scene); 

    let playerData = {

      'accel': 0.00005,
      'rotation': 0.005
    }
    let playerWeapon = [new weapon.Weapon(500, spriteManagerBullet)]
    newMesh[0].rotate(BABYLON.Axis.Y, -Math.PI/2, BABYLON.Space.LOCAL)
    entMan.insert(entities.playerShipFactory(
      {x: 0, y:-1, z: -2}, scene, newMesh[0], camera, playerWeapon, playerData
    ));
  });

  return enter_system(scene, entMan, planets, lights, ents);
};


export function enter_system(scene, entMan, planets, lights, ents) {
  let world_models = []

  for (let light of lights) {
    let new_light = new BABYLON.HemisphericLight(light.name,
        new BABYLON.Vector3(light.pos.x, light.pos.y, light.pos.z),
        scene
    );
    new_light.intensity = light.intensity;

    world_models.push(new_light);
  }

  for (let ent of ents) {
    entMan.insert( ent );
  }

  for (let planet of planets) {
    entMan.insert( planet );
  }

  return world_models;
};


function create_hud( scene ){
   var hud_canvas = new BABYLON.ScreenSpaceCanvas2D(scene, {
     id: "ScreenCanvas",
     size: new BABYLON.Size(300, 100),
     backgroundFill: "#4040408F",
     backgroundRoundRadius: 50,
     children: [
       new BABYLON.Text2D("Hello World!", {
         id: "text",
         marginAlignment: "h: center, v:center",
         fontName: "20pt Courier",
       })

     ]
  });
};

$(() => {
  $.getJSON('data/systems.json', function( systems ) {
    setupGameplayRender( $('#gameCanvas'), systems );
  });
});

