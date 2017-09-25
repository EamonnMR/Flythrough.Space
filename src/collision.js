import * as damage from "damage";
import * as util from "util";


export function collisionDetectionSystem(entMan){
  let colliders = entMan.get_with(['collider', 'position'])
  while (colliders.length > 1) {
    let current = colliders.pop();
    for (let other of colliders) {
      let dist = util.distance(current.position, other.position);
      if ( dist < current.collider.radius + other.collider.radius) {
        if ( filter_collisions(current, other)){
          damage.shot_handler(current, other );
        }
        if ( filter_collisions(other, current)){
          damage.shot_handler(other, current);
        }
      }
    }
  }
};

function filter_collisions(shot, entity){
  return ('shot' in shot && 'hittable' in entity
    && !gov_test(shot, entity)
    && !player_agent_test(shot, entity));
}

function gov_test(shot, entity){
  return 'ignoregov' in shot && 'govt' in entity && shot.ignoregov === entity.govt;
}

function player_agent_test(shot, entity){
  return 'ignore_player' in shot && 'player_aligned' in entity;
}
