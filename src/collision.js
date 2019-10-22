import { shot_handler } from "./damage.js";
import {
  distance,
  is_cheat_enabled,
  assert_true,
  assert_false
} from "./util.js";


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
  } else if ('radius' in l.collider && 'notunnel' in r.collider){
    return circle_line_collision(l, [r.position, r.previous_position]);
  } else if ('notunnel' in l.collider && 'radius' in r.collider){
    return circle_line_collision(r, [l.position, l.previous_position]);
  }
}

// Collision math

function circle_circle_collision(l, r){
  let dist = distance(l.position, r.position);
  return dist < l.collider.radius + r.collider.radius
}

function circle_line_collision(l, [start, end]){
  //TODO: http://www.jeffreythompson.org/collision-detection/line-circle.php
  console.log(start);
  console.log(end);
  return true;
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

export function collision_unit_tests(){
  assert_true(
    circle_circle_collision(
      {position: {x: 0, y: 0},
       collider: {radius: 1},
      },
      {position: {x: 1, y: 0},
       collider: {radius: 1}
      }
    ),
    "Overlapping circles collide"
  )
  assert_false(
    circle_circle_collision(
      {position: {x: 0, y: 0},
       collider: {radius: 1},
      },
      {position: {x: 4, y: 4},
       collider: {radius: 1}
      }
    ),
    "Non-Overlapping circles don't collide"
  )
}
