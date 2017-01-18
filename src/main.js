import * as gameplay from "gameplay";
import * as map from "map";
class StateManager{
  // TODO: Player state needs to persist through this
  constructor(state_hash, initial_state){
    this.states = state_hash;
    this.current_state = state_hash[initial_state];
    this.each_do( state.add_manager_reference( this ));
  }

  each_do(func){
    for (let name of Object.keys(this.states)){
      func(name, this.states[name]);
    }
  }

  update(){
    this.each_do((state) => { state.update() });
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

  // Handle resizes
  
  window.addEventListener("resize", function () {
    engine.resize();
    each_state_do( (state) => {
      state.resize(gameCanvas)
    });
  });

  // start initial state
  let states = new StateManager({
    //'gameplay': new GameplayState(engine, mapdata, spobs, player_data);
    //'map': new map.MapView();
    'menu': new MenuView(mapdata, scene, canvas)
  } 
  engine.runRenderLoop(function () {
    scene.render();
    stateManager.update();
  });
};
