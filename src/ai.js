import * as util from "util";
import * as physics from "physics";

let arc = Math.PI * 2;

let ENGAGE_DISTANCE = 50;
let ENGAGE_ANGLE = .25;
let ACCEL_DISTANCE = 1;

export function ai_system(entMan){
  for (let entity of entMan.get_with(['ai'])) {
    let ai = entity.ai;
    if (ai.state === 'violent'){
      if ('target' in ai){
        let target = entMan.get(2); // The Asteroid
        if(target){
          engage(entity, target, entMan.delta_time, entMan);
        } else {
          console.log("Target gone");
          delete ai.target;
          // TODO: Find new target
          ai.state = 'passive';
        }
      }
    }
  }
};

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
