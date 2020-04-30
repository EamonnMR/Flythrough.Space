import { shot_handler } from "./damage.js";
import {
  distance,
  is_cheat_enabled,
  assert_true,
  assert_false,
  vector_plus,
  rect_from_polar,
} from "./util.js";


export function collisionDetectionSystem(entMan){
  let colliders = entMan.get_with(['collider', 'position'])
  while (colliders.length > 1) {
    let current = colliders.pop();
    for (let other of colliders) {
      if ( is_colliding( current, other)){
        // if('reflect' in current && other.id !== 1){
        //   debugger;
        // }
        if ( filter_collisions(current, other)){
          shot_handler(current, other, entMan);
        }
        if ( filter_collisions(other, current)){
          shot_handler(other, current, entMan);
        }
      }
    }
  }
};

export function is_colliding(l, r){
  if('radius' in l.collider && 'radius' in r.collider){
    return circle_circle_collision(l, r);
  } else if ('radius' in l.collider && 'notunnel' in r.collider){
    return circle_line_collision(l, notunnel_line(r));
  } else if ('notunnel' in l.collider && 'radius' in r.collider){
    return circle_line_collision(r, notunnel_line(l));
  } else if ('length' in l.collider && 'radius' in r.collider){
    return circle_line_collision(r, beam_line(l));
  } else if ('radius' in l.collider && 'length' in r.collider){
    return circle_line_collision(l, beam_line(r));
  }
}

// Collision math

function circle_circle_collision(l, r){
  let dist = distance(l.position, r.position);
  return dist < l.collider.radius + r.collider.radius
}

function circle_line_collision(l, [start, end]){
  //Ref: http://www.jeffreythompson.org/collision-detection/line-circle.php
  if(
    // Short circuit if start or end points are inside
    distance(start, l.position) < l.collider.radius ||
    distance(end, l.position) < l.collider.radius
  ){
    return true;
  }

  let len = distance(start, end);
  
  let dot_product = (
    (
      (l.position.x-start.x) * (end.x-start.x)
    ) + (
      (l.position.y-start.y) * (end.y-start.y)
    )
  ) / Math.pow(len, 2);

  let intersection_point = {
    x: start.x + dot_product * (end.x - start.x),
    y: start.y + dot_product * (end.y - start.y)
  }
  
  // Is the closest point inside the circle?
  if(distance(intersection_point, l.position) > l.collider.radius){
    return false;
  }

  // Line / Point
  // This measures the distance between the collision point
  // and the two ends of the line. If the sum of those
  // distances is the same as the line length (modulo a small
  // buffer to deal with floatyness) then we're colliding
  // with the line segment!
  let total_distance = distance(intersection_point, start)
    + distance(intersection_point, end);
  // Allow for slight inaccuracy.
  const BUFFER = 0.1

  // TODO: Test a version of this that uses math.abs for speed
  return total_distance >= len - BUFFER
    && total_distance <= len + BUFFER;
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
  return (
    'shot' in shot
    && 'hittable' in entity
    && !gov_test(shot, entity)
    && !player_agent_test(shot, entity)
  );
}

function gov_test(shot, entity){
  return 'ignoregov' in shot && 'govt' in entity && shot.ignoregov === entity.govt;
}

function notunnel_line(entity){
  /*
   * To prevent point colliders from tunneling, get a line
   * between their last position and their current position.
   */
  return [entity.position, entity.previous_position]
}

function beam_line(entity){
  return [entity.position, vector_plus(
    entity.position,
    rect_from_polar(
      entity.direction,
      entity.collider.length
    )
  )]
}

/* Unit tests
 *
 * Right in the same file because I want to keep the module
 * interface clean.
 */

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
  );

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
  );
  assert_true(
    circle_line_collision(
      {position: {x: 1, y: 1},
       collider: {radius: 2}
      },
      [{x: 1, y: 1}, {x: 100, y: 100}]
    ),
    "Line start point inside circle collides"
  );


  assert_true(
    circle_line_collision(
      {position: {x: 1, y: 1},
       collider: {radius: 2}
      },
      [{x: 100, y: 100}, {x: 1, y: 1}]
    ),
    "Line end point inside circle collides"
  );


  assert_true(
    circle_line_collision(
      {position: {x: 0, y: 1},
       collider: {radius: 3}
      },
      [{x: 0, y: -100}, {x: 0, y: 100}]
    ),
    "Circle collides with middle of line"
  );
  assert_false(
    circle_line_collision(
      {position: {x: 4, y: 3},
       collider: {radius: 1}
      },
      [{x: 0, y: -100}, {x: 0, y: 100}]
    ),
    "Circle does not collide with distant line"
  );
}
