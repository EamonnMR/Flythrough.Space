import * as gameplay from "gameplay";
import * as player from "player";
import * as map from "map";
import * as states from "states";
import * as landing from "landing";

export function init(gameCanvas, mapdata, spobs, player_data){
  /* Main entry point for the app (after loading). Binds events and such. */
  let engine = new BABYLON.Engine( gameCanvas[0], true);

  let scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0, 0, 0);

  let camera = new BABYLON.FreeCamera(
            "camera1", new BABYLON.Vector3(0, -1, -10), scene)

  // start initial state
  
  player_data = new player.PlayerSave();

  let stateMgr = new states.StateManager({
    'gameplay': new gameplay.GameplayState(
        scene, camera, mapdata, spobs, player_data, mapdata),
    'map': new map.MapView(
        mapdata, {x: 0, y: 0}, scene, gameCanvas, player_data),

    'landing': new landing.LandingMainView(scene, gameCanvas, spobs, player_data),
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
