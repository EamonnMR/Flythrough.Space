import * as damage from "damage";
import * as util from "util";


export function collisionDetectionSystem(entMan){
  let colliders = entMan.get_with(['collider', 'position'])
  while (colliders.length > 1) {
    let current = colliders.pop();
    for (let other of colliders) {
      let dist = util.distance(current.position, other.position);
      if ( dist < current.collider.radius + other.collider.radius) {
        if ( 'shot' in current
            && 'hittable' in other
            && !gov_test(current, other)) {
          damage.shot_handler( current, other );
        }
        if ('shot' in other
            && 'hittable' in current
            && !gov_test(other, current)){
          damage.shot_handler(other, current);
        }
      }
    }
  }
};

function gov_test(shot, entity){
  console.log(shot); console.log(entity)
  return 'ignoregov' in shot && 'govt' in entity && shot.ignoregov === entity.govt;
}
