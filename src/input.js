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

let no_op = () => {};

// TODO: GameCtrl should be a class.

export function inputSystem (entMan) {
  for (let entity of entMan.get_with(['input'])) {
    if ('velocity' in entity) {
      if (inputStates.forward) {
        accelerate(entity.velocity,
                                  entity.direction,
                                  entity.accel * entMan.delta_time)
      }
    }
    if ('direction' in entity) {
      let angle = entity.rotation * entMan.delta_time;
      if (inputStates.left) {
        rotate(entity, angle);
        entity.direction_delta = -1 * angle;
      }
      else if (inputStates.right) {
        rotate(entity, -1 * angle );
        entity.direction_delta = angle;
      }
//      else {
//        entity.direction_delta = 0;
//      }
    }
    if ('weapons' in entity && inputStates.shoot) {
      for (let weapon of entity.weapons){
        weapon.tryShoot(entMan, entity);
      }
    }
  }
};

let inputStates = {
  'forward': false,
  'left': false,
  'right': false,
  'shoot': false
};

function handleKeyDown ( event ){
  switch(event.keyCode){
    case 38:
      inputStates.forward = true;
      break;
    case 37:
      inputStates.left = true;
      break;
    case 39:
      inputStates.right = true;
      break;
    case 17:
      inputStates.shoot = true;
      break;
  }
};

function handleKeyUp ( event ){
  switch(event.keyCode){
    case 38:
      inputStates.forward = false;
      break;
    case 37:
      inputStates.left = false;
      break;
    case 39:
      inputStates.right = false;
      break;
    case 17:
      inputStates.shoot = false;
      break;
    case 27: // escape
      if(!debounce_esc){
        console.log('escape');
        debounce_esc = true;
        setTimeout(() => {
          debounce_esc = false;
          console.log('debounce');
        }, 5000);
        game_ctrl.toggle_pause();
      }
      break;
    case 82: // 'r'
      game_ctrl.reset_game();
      break;
    case 74: // 'j'
      game_ctrl.hyper_jump();
      break;
    case 76: // 'l'
      game_ctrl.try_land();
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
  reset_game: no_op,
  hyper_jump: no_op,
  try_land: no_op,
};

export function unbindInputFunctions(){
  game_ctrl = no_op_game_ctrl;
}
