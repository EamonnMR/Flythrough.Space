import { shot_handler } from "./damage.js";
import { distance, is_cheat_enabled } from "./util.js";


export function collisionDetectionSystem(entMan){
  let colliders = entMan.get_with(['collider', 'position'])
  while (colliders.length > 1) {
    let current = colliders.pop();
    for (let other of colliders) {
      let dist = distance(current.position, other.position);
      if ( dist < current.collider.radius + other.collider.radius) {
        if ( filter_collisions(current, other)){
          shot_handler(current, other );
        }
        if ( filter_collisions(other, current)){
          shot_handler(other, current);
        }
      }
    }
  }
};

function real_player_agent_test(shot, entity){
  return shot.ignore_player && 'player_aligned' in entity;
}

function godmode_player_agent_test(shot, entity){
  return 'player_aligned' in entity;
}
let player_agent_test = real_player_agent_test;
if(is_cheat_enabled("noclip")){
  player_agent_test = godmode_player_agent_test;
}

function filter_collisions(shot, entity){
  return ('shot' in shot
    && 'hittable' in entity
    && !gov_test(shot, entity)
    && !player_agent_test(shot, entity)
  );
}

function gov_test(shot, entity){
  return 'ignoregov' in shot && 'govt' in entity && shot.ignoregov === entity.govt;
}

