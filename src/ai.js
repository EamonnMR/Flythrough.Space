import * as collision from "collision";
import * as physics from "physics";

export function ai_system(entMan){
  for (let entity of entMan.get_with(['ai'])) {
    let ai = entity.ai;
    if (ai.state === 'violent'){
      if ('target' in ai){
        engage(entity, entMan);
      }
    }
  }
};

function point_at(to, from){
  let angle = Math.atan2(to.y - from.y, to.x - from.x);
  
  if(angle > arc){
    playerAngle -= arc;
  }
  if(angle < -arc){
    playerAngle += arc;
  }

  return angle;
}

function engage(entity, entMan){
  let arc = Math.pi * 2;
  let cos;
  let sin;
  
  let target = entMan.get(entity.ai.target)

  if(!target){
    return  // Somehow inducate that we should change state
  }

  let distance = collision.distance(this.position, target.position);
  
  // Get the ideal facing
  let goal_angle = physics.rotate(point_at(target.position, entity.position), -1 * entity.direction);
  // If angle is outside a certain margin, rotate the ship to face the target
  // Maybe pull this out into a "AI tries to face in a direction" system?
  
  angle = entity.rotation * entMan.delta_time // How far we _can_ turn this frame

  if(goal_angle > .01){
    physics.rotate(entity, angle);
    entity.direction_delta = -1 * angle;
  }
  if(goal_angle < -.01){
    physics.rotate(entity, -1 * angle);
    entity.direction_delta = angle;
  }

  var dir = Math.atan2(this.vy, this.vx);
  if(playerDistance > 50 &&  (playerAngle < .25 || playerAngle > -.25)){
      physics.accelerate(entity.velocity, entity.direction,
         entity.accel * entMan.delta_time); 
  } else {
    if(playerDistance > 40 &&  (playerAngle < .2 || playerAngle > -.2)){
      for (let weapon of entity.weapons){
        weapon.tryShoot(entMan, entity);
      }
    }
  }
  
};
