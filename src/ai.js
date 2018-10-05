import { distance, point_at } from "./util.js";
import { rotate, accelerate, /*decelerate*/ } from "./physics.js";
import { get_bone_group } from "./graphics.js";

const ARC = Math.PI * 2;

const TURN_MIN = Math.PI / 25;

// For a more interesting game, these should probably be ship properties.
// Might not be crazy to calculate them based on the ship's stats and allow
// for an override in the data
const ENGAGE_DISTANCE = 50;
const ENGAGE_ANGLE = .25;
const ACCEL_DISTANCE = 1;

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
        // Aggro is a list of entities that have pissed this entity off
        // Go through the aggro list till it finds one that is alive
      }
      if ('govt' in entity){
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
              console.log("govts are different - check if foe");
              if (govt.attack_default || ('foes' in govt && govt.foes.includes(foe.govt))){
                console.log("Found target of foe govt: " + foe.govt + ", attacking!");
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
            console.log("Found player-aligned target, attacking!");
            set_target(ai, foe);
            return;
          } 
        }

        if ("attacks_asteroids" in govt){
          ai.state = 'asteroid_hate';
        }
      }

      // Do neautral passive things such as fly to planets or leave the system
      
    }
  }
};

function set_target(ai_component, target_entity){
  console.log("target aquired: " + target_entity.id);
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

function constrained_point(source, source_angle, destination, possible_turn){
  // Get the ideal facing, subtract out current angle
  let goal_turn = point_at(destination, source_angle, source);
  // If angle is outside a certain margin, rotate the ship to face the target
  // Maybe pull this out into a "AI tries to face in a direction" system?
  let turn = 0;

  if(goal_turn > 0){
    if(goal_turn > possible_turn){
      return possible_turn;
    } else {
      return goal_turn;
    }
  } else if (goal_turn < 0){
    if(Math.abs(goal_turn) > possible_turn){
      return possible_turn * -1;
    } else {
      return goal_turn;
    }
  }
}

function engage(entity, target, delta_time, entMan){

  let distance = distance(entity.position, target.position);
  
  let final_turn = constrained_point(entity.position, entity.direction, target.position, entity.rotation * delta_time);

  // Why?
  entity.ai.angle = distance;
  
  // Do rotation 
  rotate(entity, -1 * final_turn );
  entity.direction_delta = final_turn;

  // Acclerate
  if(distance > ACCEL_DISTANCE){
    accelerate(entity.velocity, entity.direction,
       entity.accel * delta_time); 
  } //else {
  //  decelerate(entity.velocity)
  //}
  if(entity.directon < ENGAGE_ANGLE || entity.direction > -1 * ENGAGE_ANGLE){
    if(distance < ENGAGE_DISTANCE){
      for (let weapon of entity.weapons){
        weapon.tryShoot(entMan, entity);
      }
    }
  }
  
};

export function turretPointSystem (entMan) {
  const TURRET_ROT_SPEED = Math.PI / 10;
  for(let entity of entMan.get_with(['model'])) {
    if(entity.model.skeleton){
      if(entity.target){
        // In this case we want to track the target
        let target = entMan.get(entity.target);
        if(target){
          for(let bone of get_bone_group(entity.model.skeleton, "turret")){
            // Crude method: point all turrets at the same angle
            // (ie no convergence)
            let current_angle = bone.rotation.y;
            let turn = constrained_point(entity.position, current_angle, target.position, Math.PI / 20); 
            // Small amount of dampening to prevent jitter
            if( Math.abs(turn) > TURN_MIN ){
              bone.rotate(BABYLON.Axis.Y, turn, BABYLON.Space.LOCAL);
            }
          }
        }
      }
    }
  }
};

