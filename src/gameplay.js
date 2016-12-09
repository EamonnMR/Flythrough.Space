import * as physics from "physics";
import * as weapon from "weapon";
import * as ecs from "ecs";
import * as input from "input";
import * as entities from "entities";
import * as collision from "collision";
import * as map from "map";
import * as system from "system";


export function setupGameplayRender (gameCanvas, mapdata, current_system) {
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
  let world_models = system.setup_system(scene, camera, entMan,
                                         current_system,
                                         mapdata.systems[current_system]);

  let map_view = null; // Only populated while game is paused

  let map_pos = {x: 0, y: 0};

  let selected_system = current_system;

  window.addEventListener("resize", function () {
    engine.resize();
    if (map_view){
      let {position, selection} = map_view.dispose(gameCanvas);
      map_view = new map.MapView(mapdata, position,
                                 scene, gameCanvas, selection );
    }
  });


  input.bindInputFunctions({
    'toggle_pause': function(){
      if ( entMan.paused ){
        entMan.unpause();
        // TODO: Refactor w/ destructuring
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
      world_models = system.setup_system(scene, camera, entMan,
                                         current_system, 
                                         mapdata.systems[current_system]);
    },

    'hyper_jump': function() {

      current_system = selected_system;

      entMan.clear();
      for (let world_model of world_models){
        world_model.dispose();
      }
      world_models = system.setup_system(scene, camera, entMan,
                                         current_system,
                                         mapdata.systems[current_system]);
    }

  });

  engine.runRenderLoop(function () {
    scene.render();
    entMan.update();
  });
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
    setupGameplayRender( $('#gameCanvas'), systems, 'Casamance' );
  });
});

