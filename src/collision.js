import { shot_handler } from "./damage.js";
import { distance, is_cheat_enabled } from "./util.js";


export function collisionDetectionSystem(entMan){
  let colliders = entMan.get_with(['collider', 'position'])
  while (colliders.length > 1) {
    let current = colliders.pop();
    for (let other of colliders) {
      if ( is_colliding( current, other)){
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

function is_colliding(l, r){
  if('radius' in l.collider && 'radius' in r.collider){
    return circle_circle_collision(l, r);
  } // TODO: else: handle circle/line
}

function circle_circle_collision(l, r){
  let dist = distance(l.position, r.position);
  return dist < l.collider.radius + r.collider.radius
}

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

