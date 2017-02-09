// import * as gameplay from "gameplay";
// import * as map from "map";
import * as menu from "menu";


/* StateManager - FSM for game states
 * see states.js for more info on the state class.
 * If we ever move to typescript, we can enforce this.
 */
class StateManager{
  // TODO: Player state needs to persist through this
  constructor(state_hash, initial_state){
    this.states = state_hash;
    this.current_state = state_hash[initial_state];
		// Is this a poorly hatched scheme?
    this.each_do((state) => { state.mgr = this; });
  }

  each_do(func){  // Still waiting on a saner way to do this
    for (let name of Object.keys(this.states)){
      func(this.states[name], name);
    }
  }

  update(){
    this.each_do((state) => { state.update() });
  }

  resize(){ // TODO: Figure out what we can provide for this
    this.each_do((state) => { state.resize() });
  }

  enter_state(new_state){
    this.current_state.exit();
    this.current_state = this.states[new_state];
    this.current_state.enter();
  }
}

export function init(gameCanvas, mapdata, spobs, player_data){
  /* Main entry point for the app (after loading). Binds events and such. */
  let engine = new BABYLON.Engine( gameCanvas[0], true);

  let scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0, 0, 0);

  let camera = new BABYLON.FreeCamera(
            "camera1", new BABYLON.Vector3(0, -1, -10), scene)

  // start initial state
  let states = new StateManager({
    //'gameplay': new GameplayState(engine, mapdata, spobs, player_data);
    //'map': new map.MapView();
    'menu': new menu.MainMenuView(scene, gameCanvas)
  });
 
  // Handle resizes

  window.addEventListener("resize", () => {
    engine.resize();
    states.resize();
  });


  engine.runRenderLoop( () => {
    scene.render();
    states.update();
  });
};
