import * as gameplay from "gameplay";
import * as player from "player";
import * as map from "map";
import * as states from "states";
import * as landing from "landing";

function init(gameCanvas, scene, engine, data){
  /* Main entry point for the app (after loading). Binds events and such. */

  scene.clearColor = new BABYLON.Color3(0, 0, 0);



  let camera = new BABYLON.FreeCamera(
            "camera1", new BABYLON.Vector3(0, -1, -10), scene);

  // start initial state
  
  let player_data = new player.PlayerSave();

  let stateMgr = new states.StateManager({
    'gameplay': new gameplay.GameplayState(
        scene, camera, data, player_data, gameCanvas),
    'map': new map.MapView(
        data, {x: 0, y: 0}, gameCanvas, player_data),

    'landing': new landing.LandingMainView(scene, gameCanvas, data.spobs, player_data),
  }, 'gameplay');
 
  // Handle resizes

  window.addEventListener("resize", () => {
    engine.resize();
    stateMgr.resize();
  });


  engine.runRenderLoop( () => {
    scene.render();
    stateMgr.update();
  });
};

$(() => {
  let systems, spobs, models, images;
  let game_canvas = $('#gameCanvas'); 
  let engine = new BABYLON.Engine( game_canvas[0], true);
  let scene = new BABYLON.Scene(engine);

  load.load_all(engine, scene, (data) => {
    init(game_canvas, scene, engine, data);
  });
});
