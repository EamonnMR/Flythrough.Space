/* ViewState - represents a mode of the game
 * such as menu, gameplay, etc.
 */

export class ViewState{
  constructor(){
    this.parent = null;
  }

  update(){
    // This will be called to progress gameplay, animation, etc.
  }

  resize(){
    // This will be called if the window is resized.
  }

  enter(){
    // Initial setup.
    //
    // Since states persist beyond entering and exiting, you can cache
    // what you'd like to and use enter/exit to explicitly create and
    // destroy needed resources.
	}

  exit(){
    // Cleanup
  }
}


/* StateManager - FSM for game states
 * see states.js for more info on the state class.
 * If we ever move to typescript, we can enforce this.
 */
export class StateManager{
  // TODO: Player state needs to persist through this
  constructor(state_hash, initial_state){
    this.states = state_hash;
    this.current_state = state_hash[initial_state];
    // Is this a poorly hatched scheme?
    this.each_do((state) => { state.parent = this; });
    this.current_state.enter();
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
    // TODO: Do we want to cache anything on a resize? If not,
    // we should not bother resizing all states, just tue current one.
    // this.each_do((state) => { state.resize() });
    this.current_state.resize();
  }

  enter_state(new_state){
    this.current_state.exit();
    this.current_state = this.states[new_state];
    this.current_state.enter();
  }
}

