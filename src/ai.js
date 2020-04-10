import { _ } from "./singletons.js";
import {
  distance,
  random_position,
  in_firing_arc,
  angle_mod,
  overridable_default,
  point_directly_at,
  rect_from_polar,
  vector_plus,
} from "./util.js";
import {
  world_position_from_model
} from "./graph_util.js";

import { rotate, accelerate, decelerate, linear_vel } from "./physics.js";

const ARC = Math.PI * 2;  // I don't want to make a political statement by using TAU

// const TURN_MIN = Math.PI / 75;

// For a more interesting game, these should probably be ship properties.
// Might not be crazy to calculate them based on the ship's stats and allow
// for an override in the data
const ENGAGE_DISTANCE = 100;       // How close to a target before firing weapons
const ENGAGE_ANGLE = Math.PI / 8;  // How far off of target to be when taking a shot
const TURN_FLOOR = Math.PI / 12;   // How small a turn is too small?
const ACCEL_DISTANCE = 10;         // How far from a target before firing thrusters
const IDLE_ARRIVAL_THRESH = 50;
const AI_DWELL_MAX = 1000;         // How long to wait around
const AI_IDLE_COAST = 0.01;

export function ai_system(entMan){
  for (let entity of entMan.get_with(['ai'])) {
    entity.thrust_this_frame = false;
    if(entity.disabled){
      continue;
    }
    let ai = entity.ai;
    if (ai.state === 'violent'){
      if ('target' in ai){
        let target = entMan.get(ai.target);
        if(target){
          engage(entity, target, entMan.delta_time, entMan);
        } else {
          delete ai.target;
          ai.state = "passive";
        }
      }
    } else if (ai.state == 'asteroid_hate'){
      let target = find_closest_target(entity.position, entMan, ['team-asteroids']);
      // TODO: Really rework how Asteroids are handled.
      if(target){
        set_target(ai, target);
      } else {
        ai.state = 'passive';
      }
    } else if (ai.state == 'passive') {
      // This is sort of the hub behavior - select a new thing to do
      if ('mothership' in entity){
        obey_orders(entity);
      }
      if ('aggro' in ai){
        // It's personal. Some ship has angered this specific ship.
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
        let govt = _.data.govts[entity.govt];
        // TODO: Really this should look at the closest hittable target
        // and integrate the player / govt logic together
        if (govt.attack_default || _.player.is_govt_hostile(entity.govt)){
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
            (govt.attack_default || _.player.is_govt_hostile(entity.govt))
          ){
            set_target(ai, foe);
            return;
          } 
        }

        if ("attacks_asteroids" in govt){ 
          ai.state = 'asteroid_hate';
        }
      }

      // Do neutral passive things such as fly to planets or leave the system
      idle(entity, ai, entMan.delta_time);
      
    }
  }
};

function obey_orders(entity){
  let ai = entity.ai;
  let mothership = _.entities.get(entity.mothership);
  if (mothership){
    switch(mothership.order){
      case "attack_target":
        let possible_target = _.entities.get(mothership.target);
        if(possible_target){
          console.log("Ordered to attack target");
          set_target(ai, possible_target);
        } else {
          console.log("ordered to attack but no target");
          ai.destination = mothership.position;
        }
        break;
      case "recall":
        console.log("Ordered to return to mothership");
        ai.destination = mothership.position;
        break;
    }
  } else {
    // Mothership is gone, now it's just a regular AI
    delete entity.mothership;
  }
}

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
      if(linear_vel(entity.velocity) < AI_IDLE_COAST){
        // Ships shouldn't race around if they're idling
        accelerate(entity.velocity, entity.direction, entity.accel * delta_time);
        entity.thrust_this_frame = true;
      }
    }
  } else {
    ai.destination = random_position()
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
  

function point_at(to, startangle, from, lead, to_vel=null, from_vel=null, proj_vel=null){
  /*
   * Calculate the shortest turn to point at a moving target
   */
  let cw = point_directly_at(from, to) - startangle;
  // A/B/C Test: Is target leading good? Should we do it?
  if(lead === "basic" && to_vel && from_vel && proj_vel){
    cw = find_firing_solution(to, to_vel, from, from_vel, proj_vel) - startangle;
  }
  let ccw = ARC;
  //let ccw = (Math.atan2(dy, dx) - startangle);
  if (cw > 0){
    ccw = ARC - cw;
  } else {
    ccw = ARC + cw;
  }
  
  if(Math.abs(cw) < Math.abs(ccw)){
    return -1 * cw;
  } else {
    return -1 * ccw;
  }
  
}

function find_firing_solution(to, to_velocity, from, from_velocity, projectile_velocity){
  // TODO: This is a flawed algo and they AI looks stupid for constantly missing.
  // Maybe don't lead at all and just make shots go faster?
  let velocity_difference = {};
  if(_.settings.arcade_physics){
    velocity_difference = to_velocity;
  } else {
    velocity_difference = {
      x: to_velocity.x - from_velocity.x,
      y: to_velocity.y - from_velocity.y
    };
  }
  let estimated_impact_time = distance(from, to) / projectile_velocity;
  return point_directly_at(from, {
    x: to.x + velocity_difference.x * estimated_impact_time,
    y: to.y + velocity_difference.y * estimated_impact_time,
  })
}

function constrained_point(
  target,
  start_angle,
  position,
  possible_turn,
  to_vel,
  from_vel,
  proj_vel,
  lead="none",
){
  // point_at but with a rotation speed limit (which is most things that point)
	let goal_turn = point_at(target, start_angle, position, lead, to_vel, from_vel, proj_vel);
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
  // TODO: Be Smarter
  entity.launching_fighters = true;
	// Get the ideal facing, subtract out current angle
	// If angle is outside a certain margin, rotate the ship to face the target
	let final_turn = constrained_point(
    target.position, 
    entity.direction,
    entity.position,
    entity.rotation * delta_time,
    target.velocity,
    entity.velocity,
    0.01,
    _.settings.ai_leading ? "basic" : "none",
  );

  /* Anti Jitter
   * Because it's constantly trying to find the best firing solution and track moving targets,
   * the AI has a tendency to flap back and fourth on targets.
   *
   * This anti-jitter code adds a threshold for reversing turn direction or starting to turn.
   * If already turning in a particular direction, it will allow that turn to continue... the
   * purpose of this is to prevent quantizing turns, which is what we saw before, and jittering
   * at the edge of the threshold.
   */
  if(
      (
        !entity.previous_turn || // If we're not already turning, or...
        !( // We're changing direction
          (final_turn > 0 && entity.previous_turn > 0)
          ||
          (final_turn < 0 && entity.previous_turn < 0)
        )
      ) 
      && Math.abs(final_turn) < TURN_FLOOR  // Then only execute the turn if it's larger than a floor
    ){
    return 0;
  }

  entity.previous_turn = final_turn;

	let dist = distance(entity.position, target.position);

  // Do rotation 
  rotate(entity, -1 * final_turn );
  entity.direction_delta = final_turn;

  // Acclerate
  if(dist > ACCEL_DISTANCE){
    accelerate(entity.velocity, entity.direction,
       entity.accel * delta_time); 
    entity.thrust_this_frame = true;
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
  // Code to actually rotate the turret graphic should live in graphics.js
  // Torn about where to keep the rotation state.
  for(let entity of entMan.get_with(['turrets'])) {
    let target_id = entity.target;
    if('ai' in entity){
      target_id = entity.ai.target;
    }
    if(target_id){
      // In this case we want to track the target
      let target = entMan.get(target_id);
      for(let turret of entity.turrets){
        let [turret_origin, _turret_depth, turret_angle] = world_position_from_model(turret.model);
        if(target){
          let current_angle = angle_mod(entity.direction + turret.model.rotation.y - Math.PI / 2); 
          // TODO: Seems like this does not get the actual rotation of the turret mesh,
          // which is in turn preventing correct aiming.
          let turn = -1 * constrained_point(
            target.position,
            turret_angle,
            turret_origin,
            entity.turret_rot_speed || turret.rot_speed * entMan.delta_time,
            target.velocity,
            entity.velocity,
            0.01,
          ); 
          // Constrain turret to firing arc if applicable 
          let current_rel_angle = angle_mod(turret.model.rotation.y);
          let new_angle = angle_mod(turret.model.rotation.y - turn);

          /*
          let do_turn = false;
          if (turret.traverse){
            if( in_firing_arc( new_angle, turret.facing, turret.traverse)){
              do_turn = true;
            } else {
            }
          } else {
            do_turn = true;
          }
          */

          let do_turn = true;
          if(do_turn){
            turret.model.rotate(BABYLON.Axis.Y, -1 * turn, BABYLON.Space.LOCAL);
          } else {
            turret.model.rotate(BABYLON.Axis.Y, 0, BABYLON.Space.LOCAL)
          }
        }
        /*
        else{
          // Move zero to force attachment
          // This is such a hack
          // And isn't working anyway
          console.log("No target");
        }
        */
      }
    }
  }
};

