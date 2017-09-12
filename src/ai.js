import * as util from "util";
import * as physics from "physics";

let arc = Math.PI * 2;


// For a more interesting game, these should probably be ship properties.
// Might not be crazy to calculate them based on the ship's stats and allow
// for an override in the data
let ENGAGE_DISTANCE = 50;
let ENGAGE_ANGLE = .25;
let ACCEL_DISTANCE = 1;

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
          // TODO: Find new target
          ai.state = 'passive';
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

        // if player_data.govts.reputation == bad or neautral if govt.
        // attack by default, attack the player. Else:
        
        for(let foe of list_closest_targets(entity.position, entMan, ['govt', 'hittable'])){
          if (foe.govt !== entity.govt){
            console.log("govts are different - check if foe");
            if (govt.attack_default || ('foes' in govt && govt.foes.includes(foe.govt))){
              console.log("Found target of foe govt: " + foe.govt + ", attacking!");
              set_target(entity.ai, foe);
            }
          }
        }
      }

      // Do normal passive things such as fly to planets
      
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
    

function point_at(to, startangle, from){
  let dx = to.x - from.x;
  let dy = to.y - from.y;
  
  // console.log(("dx " + dx) + ", dy " + dy);
  let cw = (Math.atan2(dy, dx) - startangle);
  let ccw = arc;
  //let ccw = (Math.atan2(dy, dx) - startangle);
  if (cw > 0){
    ccw = arc - cw;
  } else {
    ccw = arc + cw;
  }
  // console.log("cw:  " + cw);
  // console.log("ccw: " + ccw);
  
  if(Math.abs(cw) < Math.abs(ccw)){
    return -1 * cw;
  } else {
    return -1 * ccw;
  }
  
}

function engage(entity, target, delta_time, entMan){

  let distance = util.distance(entity.position, target.position);
  
  // Get the ideal facing, subtract out current angle
  let goal_turn = point_at(target.position, entity.direction, entity.position);
  // If angle is outside a certain margin, rotate the ship to face the target
  // Maybe pull this out into a "AI tries to face in a direction" system?
  let final_turn = 0;
  let possible_turn = (entity.rotation * delta_time); // How far we _can_ turn this frame

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
  entity.ai.angle = distance;
  
  // Do rotation 
  physics.rotate(entity, -1 * final_turn );
  entity.direction_delta = final_turn;

  // Acclerate
  if(distance > ACCEL_DISTANCE){
    physics.accelerate(entity.velocity, entity.direction,
       entity.accel * delta_time); 
  } //else {
  //  physics.decelerate(entity.velocity)
  //}
  if(entity.directon < ENGAGE_ANGLE || entity.direction > -1 * ENGAGE_ANGLE){
    if(distance < ENGAGE_DISTANCE){
      for (let weapon of entity.weapons){
        weapon.tryShoot(entMan, entity);
      }
    }
  }
  
};
