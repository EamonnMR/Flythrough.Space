import { shot_handler } from "./damage.js";
import { distance, dot_product, is_cheat_enabled } from "./util.js";


export function collisionDetectionSystem(entMan){
  let colliders = entMan.get_with(['collider', 'position'])
  while (colliders.length > 1) {
    let current = colliders.pop();
    for (let other of colliders) {
      if(is_colliding(current, other)){
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

// This is the purely geometrical logic to decide if things overlap.
// TODO: If we ever have enough on screen that this becomes slow, use a data structure
// such as a quadtree to optomize it.

function is_colliding(a, b){
  if("radius" in a.collider && "radius" in b.collider){
    return circle_circle_collision(a, b);
  } else if ("radius" in a.collider && "start" in b.collider){
    return circle_line_collision(a, b);
  } else if ("start" in a.collider && "radius" in b.collider){
    return circle_line_collision(b, a);
  }
  // Unhandled cases do not collide
  return false;
};

function circle_circle_collision(a, b){
  return distance(a.position, b.position) < a.collider.radius + b.collider.radius
};

function circle_line_collision(circle_entity, line_entity){
  // https://stackoverflow.com/a/1084899/1048464
  // Please refer to the well commented and discussed quadratic equation on
  // stack overflow.
  let e = line_entity.collider.start
  let l = line_entity.collider.end
  let c = circle_entity.position
  let r = circle_entity.collider.radius
  let d  = vector_minus(line.collider.end, line.collider.start);
  let f  = vector_minus(line.collider.start, circle_entity.position);
  let a = dot_product(d, d);
  let b = 2 * dot_product( d, f) ;
  let c = dot_product(f, f) - Math.pow(r, 2) ;

  let discriminant = b*b-4*a*c;
  if( discriminant < 0 ){
    // no intersection
  } else {
    // ray didn't totally miss sphere,
    // so there is a solution to
    // the equation.

    discriminant = sqrt( discriminant );

    // either solution may be on or off the ray so need to test both
    // t1 is always the smaller value, because BOTH discriminant and
    // a are nonnegative.
    let t1 = (-b - discriminant)/(2*a);
    let t2 = (-b + discriminant)/(2*a);

    // 3x HIT cases:
    //          -o->             --|-->  |            |  --|->
    // Impale(t1 hit,t2 hit), Poke(t1 hit,t2>1), ExitWound(t1<0, t2 hit), 

    // 3x MISS cases:
    //       ->  o                     o ->              | -> |
    // FallShort (t1>1,t2>1), Past (t1<0,t2<0), CompletelyInside(t1<0, t2>1)

    if( t1 >= 0 && t1 <= 1 ){
      // t1 is the intersection, and it's closer than t2
      // (since t1 uses -b - discriminant)
      // Impale, Poke
      return true ;
    }

    // here t1 didn't intersect so we are either started
    // inside the sphere or completely past it
    if( t2 >= 0 && t2 <= 1 ){
      // ExitWound
      return true ;
    }

    // no intn: FallShort, Past, CompletelyInside
    return false ;
  }
}

function line_line_collision(a, b){
  // TODO: There's an algorithm for this
  return false;  
}

// This is the logic that decides if we care about a given collision. 
// Functions that follow are kinds of exceptions to the general "things hit other things" rule.

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


function real_player_agent_test(shot, entity){
  return shot.ignore_player && 'player_aligned' in entity;
}

function godmode_player_agent_test(shot, entity){
  return 'player_aligned' in entity;
}
function gov_test(shot, entity){
  return 'ignoregov' in shot && 'govt' in entity && shot.ignoregov === entity.govt;
}

