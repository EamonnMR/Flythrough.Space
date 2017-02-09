// import * as gameplay from "gameplay";
// import * as map from "map";
import * as menu from "menu";
import * as states from "states";

export function init(gameCanvas, mapdata, spobs, player_data){
  /* Main entry point for the app (after loading). Binds events and such. */
  let engine = new BABYLON.Engine( gameCanvas[0], true);

  let scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0, 0, 0);

  let camera = new BABYLON.FreeCamera(
            "camera1", new BABYLON.Vector3(0, -1, -10), scene)

  // start initial state
  let stateMgr = new states.StateManager({
    //'gameplay': new GameplayState(engine, mapdata, spobs, player_data);
    //'map': new map.MapView();
    'menu': new menu.MainMenuView(scene, gameCanvas)
  });
 
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
