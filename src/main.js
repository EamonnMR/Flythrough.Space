import { GamePlayState } from "./gameplay.js";
import { PlayerSave } from  "./player.js";
import { MapView } from "./map.js";
import { StateManager } from "./states.js";
import { LandingMenu } from  "./landing.js";
import { TradeMenu } from  "./trade.js";
import { ShipyardMenu} from "./shipyard.js";
import { load_all } from "./load.js";

function init(game_canvas, scene, engine, data){
  /* Main entry point for the app (after loading). Binds events and such. */

  scene.clearColor = new BABYLON.Color3(0, 0, 0);



  let camera = new BABYLON.FreeCamera(
            "camera1", new BABYLON.Vector3(0, -1, -10), scene);

  // start initial state
  
  let player_data = new PlayerSave(data.ships, data.upgrades);
  let stateMgr = new StateManager({
    'gameplay': new GamePlayState(
        scene, camera, data, player_data),
    'map': new MapView(
        data, {x: 0, y: 0}, game_canvas, player_data),

    'landing': new LandingMenu(data.spobs, player_data),
    'trade': new TradeMenu(data.spobs, player_data, data.trade),
    'shipyard': new ShipyardMenu(data.spobs, player_data, data.ships),
  }, 'shipyard');
 
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

window.addEventListener('load', () => {
  console.log("Welcome to flythrough.space");
  let systems, spobs, models, images;
  let game_canvas = document.getElementById("gameCanvas"); 
  let engine = new BABYLON.Engine( game_canvas, true);
  let scene = new BABYLON.Scene(engine);

  load_all(engine, scene, (data) => {
    init(game_canvas, scene, engine, data);
  });
});
