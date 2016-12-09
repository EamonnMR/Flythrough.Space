let game_ctrl = null;

export function inputSystem (entMan) {
  for (let entity of entMan.get_with(['input'])) {
    if ('velocity' in entity) {
      if (inputStates.forward) {
        physics.accelerate(entity.velocity,
                                  entity.direction,
                                  entity.data.accel * entMan.delta_time)
      }
    }
    if ('direction' in entity) {
      let angle = entity.data.rotation * entMan.delta_time;
      if (inputStates.left) {
        physics.rotate(entity, angle);
        entity.direction_delta = -1 * angle;
      }
      else if (inputStates.right) {
        physics.rotate(entity, -1 * angle );
        entity.direction_delta = angle;
      }
      else {
        entity.direction_delta = 0;
      }
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
      game_ctrl.toggle_pause();
      break;
    case 82: // 'r'
      game_ctrl.reset_game();
      break;
    case 74: // 'j'
      game_ctrl.hyper_jump();
      break;
  }
};

export function bindInputFunctions(new_game_ctrl){
  $(document).keydown( handleKeyDown );
  $(document).keyup( handleKeyUp );

  game_ctrl = new_game_ctrl;
};

