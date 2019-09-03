import { get_modal } from "./modal.js"; // Circular?

export class StateManager{
  constructor(state_hash, initial_state){
    this.states = state_hash;
    this.current_state = state_hash[initial_state];
    // TODO: Is this a poorly hatched scheme?
    this.each_do((state) => { state.parent = this; });
    this.current_state.enter();
    this.modal_stack = [];
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

  // See modal.js

  enter_modal(modal){
    this.current_state.exit();
    this.modal_stack.push(this.current_state);
    this.current_state = get_modal(modal);
    this.current_state.enter();
  }
  
  exit_modal(){
    this.current_state.exit();
    this.current_state = this.modal_stack.pop()
    this.current_state.enter();
    // It is an error to call this from anything other than a modal
  }
}

