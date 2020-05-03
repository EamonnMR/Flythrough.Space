import { accelerate, rotate } from "./physics.js";

/* Some slightly gross stuff here - 
 * Basically using the module as a singleton object to hold the current
 * game_ctrl which ought to be a class but isn't, with member functions
 * that allow different game states to respond to different key presses.
 *
 * Its abstracted in that the states bind to an action rather than a key
 * code, but the key codes are hardcoded here. So, as I said, slightly
 * gross. */

let game_ctrl = null;

let debounce_esc = false;

let no_op = () => {
  console.log("Not Implemented for state")
};

// TODO: GameCtrl should be a class.

export function inputSystem (entMan) {
  for (let entity of entMan.get_with(['input'])) {
    if (entity.disabled){
      continue;
    }
    if ('velocity' in entity) {
      if (input_states.forward) {
        entity.thrust_this_frame = true;
        accelerate(entity.velocity,
                                  entity.direction,
                                  entity.accel * entMan.delta_time)
      } else {
        entity.thrust_this_frame = false;
      }
    }
    if ('direction' in entity) {
      let angle = entity.rotation * entMan.delta_time;
      if (input_states.left) {
        rotate(entity, angle);
        entity.direction_delta = -1 * angle;
      }
      else if (input_states.right) {
        rotate(entity, -1 * angle );
        entity.direction_delta = angle;
      }
    }
    if (input_states.shoot) {
      entity.shoot_primary = true;
    }
    if (input_states.shoot_secondary) {
      entity.shoot_secondary = true;
    }
    if (input_states.launch_fighters){
      entity.launching_fighters = true;
    } else {
      delete entity.launching_fighters;
    }
    if (input_states.fighters_attack){
      entity.order = "attack_target";
    } else if (input_states.recall_fighters){
      entity.order = "recall";
    } else {
      delete entity.order;
    }
  }  
};

// TODO: Use this to handle up and down
const TOGGLED_INPUT_MAP = {
  38: "forward",
  37: "left",
  39: "right",
  32: "shoot", // Spacebar
  88: "cycle_secondary",  // x
  90: "shoot_secondary",  // z
  81: "launch_fighters",  // q
  82: "recall_fighters",  // r
  70: "fighters_attack",  // f
}

// TODO: Use this to handle single presses
const ONESHOT_INPUT_MAP = {
  27: 'toggle_pause', // Escape
  221: 'zoom_in', // Keyboard [
  219: 'zoom_out', // Keyboard ]
  76: 'try_land', // 'l'
  74: 'hyper_jump', // 'j'
  66: 'board', // b
  89: 'hail', // y
  77: 'open_map', // m
  192: 'select_closest', // ` (backtick)
}

let input_states = {};

for(let state of Object.values(TOGGLED_INPUT_MAP)){
  input_states[state] = false;
}

function handleKeyDown ( event ){
  if(event.keyCode in TOGGLED_INPUT_MAP){
    input_states[TOGGLED_INPUT_MAP[event.keyCode]] = true;
  }
};

function handleKeyUp ( event ){
  if(event.keyCode in TOGGLED_INPUT_MAP){
    input_states[TOGGLED_INPUT_MAP[event.keyCode]] = false;
    return;
  }
  if(event.keyCode in ONESHOT_INPUT_MAP){
    game_ctrl[ONESHOT_INPUT_MAP[event.keyCode]]();
    return;
  }

  // One-shot keypresses
  switch(event.keyCode){

    case 49: // keyboard 1, etc
      game_ctrl.select_spob(0);
      break;
    case 50: // keyboard 2, etc
      game_ctrl.select_spob(1);
      break;
    case 51: // keyboard 3, etc
      game_ctrl.select_spob(2);
      break;
    case 52: // keyboard 4, etc
      game_ctrl.select_spob(3);
      break;
    case 53: // keyboard 5, etc
      game_ctrl.select_spob(4);
      break;
    case 54: // keyboard 6, etc
      game_ctrl.select_spob(5);
      break;
  }
};

export function bindInputFunctions(new_game_ctrl){
  window.onkeydown = handleKeyDown;
  window.onkeyup = handleKeyUp;
  game_ctrl = new_game_ctrl;
};

// TODO: Make this a superclass that other gamectrls inherit from.
let no_op_game_ctrl = {
  toggle_pause: no_op, 
  hyper_jump: no_op,
  try_land: no_op,
  select_closest: no_op,
  select_spob: no_op,
  open_map: no_op,
  board: no_op,
  hail: no_op,
  zoom_in: no_op,
  zoom_out: no_op,
};

export function unbindInputFunctions(){
  game_ctrl = no_op_game_ctrl;
}
