import { distance, random_position } from "./util.js";
import { rotate, accelerate, decelerate } from "./physics.js";
import { get_bone_group } from "./graphics.js";

const ARC = Math.PI * 2;

const TURN_MIN = Math.PI / 25;

// For a more interesting game, these should probably be ship properties.
// Might not be crazy to calculate them based on the ship's stats and allow
// for an override in the data
const ENGAGE_DISTANCE = 50;
const ENGAGE_ANGLE = Math.PI / 8;
const ACCEL_DISTANCE = 10;
const IDLE_ARRIVAL_THRESH = 50;
const AI_DWELL_MAX = 1000;

export function ai_system(entMan){
  for (let entity of entMan.get_with(['ai'])) {
    let ai = entity.ai;
    if (ai.state === 'violent'){
      if ('target' in ai){
        let target = entMan.get(ai.target);
        if(target){
          engage(entity, target, entMan.delta_time, entMan);
        } else {
          console.log("Target gone");
          delete ai.target;
          ai.state = "passive";
        }
      }
    } else if (ai.state == 'asteroid_hate'){
      let target = find_closest_target(entity.position, entMan, ['team-asteroids']);
      if(target){
        set_target(ai, target);
      } else {
        console.log("No more asteroids to hate");
        ai.state = 'passive';
      }
    } else if (ai.state == 'passive') {
      // This is sort of the hub behavior - select a new thing to do
      if ('aggro' in ai){
        console.log("Checking aggro");
        // TODO: Somehow prioritize this?
        for( let possible_target_id of ai.aggro ){
          let possible_target = entMan.get(possible_target_id);
          if(possible_target){
            set_target(ai, possible_target);
            break;
          } else {
            let index = ai.aggro.indexOf(possible_target_id);
            ai.aggro.splice(index, 1);
          }
        }
      } else if ('govt' in entity){
        let govt = entMan.data.govts[entity.govt];
        // TODO: Really this should look at the closest hittable target
        // and integrate the player / govt logic together
        if (govt.attack_default || (entity.govt in entMan.player_data.govts
            && entMan.player_data.govts[entty.govt].reputation < 0)){
          let target = find_closest_target(entity.position, entMan, ['hittable', 'player_aligned']); 
          if(target){
            set_target(ai, target);
            return;
          }
        }
        
        for(let foe of list_closest_targets(entity.position, entMan, ['hittable'])){
          if('govt' in foe){ 
            if (foe.govt !== entity.govt){
              if (govt.attack_default || ('foes' in govt && govt.foes.includes(foe.govt))){
                set_target(ai, foe);
                return;
              }
            }
          } else if ('player_aligned' in foe && 
            (govt.attack_default || 
              (entity.govt in entMan.player_data.govts &&
                 entMan.player_data.govts[entty.govt].reputation < 0
              )
            )
          ){
            set_target(ai, foe);
            return;
          } 
        }

        if ("attacks_asteroids" in govt){
          ai.state = 'asteroid_hate';
        }
      }

      // Do neautral passive things such as fly to planets or leave the system
      console.log("Nothing to do; idle");
      idle(entity, ai, entMan.delta_time);
      
    }
  }
};

function idle(entity, ai, delta_time){
  if("destination" in ai){
    // TODO Fly towards destination
    let dist = distance(entity.position, ai.destination);
    if (dist < IDLE_ARRIVAL_THRESH){

      decelerate(entity.velocity, (entity.accel / 2) * delta_time);
      if("dwell_time" in ai){
        ai.dwell_time += delta_time;
      } else {
        ai.dwell_time = delta_time;
      }

      if( ai.dwell_time > AI_DWELL_MAX ){ 
        delete ai.destination;
        delete ai.dwell_time;
      }
    } else {
      // TODO: Refactor identical code from "engage" into "fly_towards"?
      let turn = constrained_point(
        ai.destination, 
        entity.direction,
        entity.position,
        entity.rotation * delta_time
      );
      rotate(entity, -1 * turn );
      entity.direction_delta = turn;
      accelerate(entity.velocity, entity.direction, entity.accel * delta_time);
    }
  } else {
    ai.destination = random_position()
    console.log("Flying aimlessly to:");
    console.log(ai.destination);
  }
}
  

function set_target(ai_component, target_entity){
  ai_component.target = target_entity.id;
  ai_component.state = 'violent';
}

function list_closest_targets(position, entMan, criteria){
  let possible_targets = entMan.get_with(criteria); // TODO: Add position to this list  
  if (possible_targets.length > 0){
    return possible_targets.sort((a, b) => {
      // Comparison function goes by distance from 'position'
      let da = Math.sqrt(Math.pow(a.position.x - position.x, 2) + 
          Math.pow(a.position.y - position.y, 2));
      let db = Math.sqrt(Math.pow(b.position.x - position.x, 2) + 
          Math.pow(b.position.y - position.y, 2));
      if(da < db){
        return 1;
      } else if (da > db){
        return -1;
      } else {
        return 0;
      }
    })
  } else {
    return [];
  }
}

function find_closest_target(position, entMan, criteria){
  let possible_list = list_closest_targets(position, entMan, criteria);
  if(possible_list){
    return possible_list[0];
  } else {
    return null;
  }
}


function point_at(to, startangle, from){
  let dx = to.x - from.x;
  let dy = to.y - from.y;
  
  // console.log(("dx " + dx) + ", dy " + dy);
  let cw = (Math.atan2(dy, dx) - startangle);
  let ccw = ARC;
  //let ccw = (Math.atan2(dy, dx) - startangle);
  if (cw > 0){
    ccw = ARC - cw;
  } else {
    ccw = ARC + cw;
  }
  // console.log("cw:  " + cw);
  // console.log("ccw: " + ccw);
  
  if(Math.abs(cw) < Math.abs(ccw)){
    return -1 * cw;
  } else {
    return -1 * ccw;
  }
  
}

function constrained_point(target, start_angle, position, possible_turn){
  // point_at but with a rotation speed limit (which is most things that point)
	let goal_turn = point_at(target, start_angle, position);
  let final_turn = 0;
	if(goal_turn > 0){
		if(goal_turn > possible_turn){
			final_turn = possible_turn;
		} else {
			final_turn = goal_turn;
		}
	} else if (goal_turn < 0){
		if(Math.abs(goal_turn) > possible_turn){
			final_turn = possible_turn * -1;
		} else {
			final_turn = goal_turn;
		}
	}

  return final_turn;

}

function engage(entity, target, delta_time, entMan){
	// Get the ideal facing, subtract out current angle
	// If angle is outside a certain margin, rotate the ship to face the target
	let final_turn = constrained_point(
    target.position, 
    entity.direction,
    entity.position,
    entity.rotation * delta_time
  );

	let dist = distance(entity.position, target.position);

  // Do rotation 
  rotate(entity, -1 * final_turn );
  entity.direction_delta = final_turn;

  // Acclerate
  if(dist > ACCEL_DISTANCE){
    accelerate(entity.velocity, entity.direction,
       entity.accel * delta_time); 
  } else {
    // decelerate(entity.velocity, (entity.accel / 2) * delta_time)
  }
  if(entity.directon < ENGAGE_ANGLE || entity.direction > -1 * ENGAGE_ANGLE){
    if(dist < ENGAGE_DISTANCE){
      entity.shoot_primary = true;
    }
  }
};

export function turretPointSystem (entMan) {
  // TODO: 
  const TURRET_ROT_SPEED = Math.PI / 50; // TODO: Make attribute of ship
  for(let entity of entMan.get_with(['model'])) {
    if(entity.model.skeleton){
      if(entity.target){
        // In this case we want to track the target
        let target = entMan.get(entity.target);
        if(target){
          for(let bone of get_bone_group(entity.model.skeleton, "turret")){
            // Crude method: point all turrets at the same angle
            // (ie no convergence)
            let current_angle = (entity.direction - bone.rotation.y ) % ARC; 
            let turn = constrained_point(target.position, current_angle, entity.position, TURRET_ROT_SPEED); 
            // Small amount of dampening to prevent jitter
            //if( Math.abs(turn) > TURN_MIN ){
              bone.rotate(BABYLON.Axis.Y, -1 *  turn, BABYLON.Space.LOCAL);
            //}
          }
        }
      }
    }
  }
};

