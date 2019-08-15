import { overridable_default } from "./util.js";
import { _ } from "./singletons.js";
import { GamePlayState } from "./gameplay.js";
import { PlayerSave } from  "./player.js";
import { MapView } from "./map.js";
import { StateManager } from "./states.js";
import { LandingMenu } from  "./landing.js";
import { TradeMenu } from  "./trade.js";
import { ShipyardMenu} from "./shipyard.js";
import { load_all } from "./load.js";
import { UpgradeMenu } from "./upgrade_store.js";
import { MissionsMenu } from "./missions_menu.js";
import { MainMenu } from "./main_menu.js";
import { get_game_camera } from "./graphics.js";

function init(game_canvas, scene, engine, data){
  /* Main entry point for the app (after loading). Binds events and such. */
  
  _.data = data;
  _.scene = scene;
  _.canvas = game_canvas;

  scene.clearColor = new BABYLON.Color3(0, 0, 0);
  _.camera = get_game_camera();

  // start initial state
  
  let player_data = new PlayerSave();
  _.player = player_data;
  let stateMgr = new StateManager({
    'gameplay': new GamePlayState(),
    'map': new MapView({x: 0, y: 0}),
    'landing': new LandingMenu(),
    'trade': new TradeMenu(),
    'shipyard': new ShipyardMenu(),
    'upgrades': new UpgradeMenu(),
    'missions': new MissionsMenu(),
    'main'    : new MainMenu(),
  }, overridable_default("state", "main"));

  _.state_manager = stateMgr;
 
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
