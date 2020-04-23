import { _ } from "./singletons.js";
import { distance, get_direction, rect_from_polar, point_directly_at } from "./util.js";
import { rotate } from "./physics.js";

const HYPERJUMP_COST = 1.0;
const WARP_IN_DIST_FACTOR = 2;
// TODO: Cool special effects function? (or in graphics.js?)

export function has_sufficient_fuel(entity){
  return 'fuel' in entity && entity.fuel >= HYPERJUMP_COST;
}

export function has_sufficient_distance(entity){
  // TODO: Add an attribute to entities that allows you to change distance
  // TODO: Check system for massive objects?
  return distance({x:0, y:0}, entity.position) > entity.min_hyperjump_distance;
}

export function warpSystemFactory(gameplay){
  /* This is a function factory rather than just a function, because
   * we need to wrap gameplay to get get_stars(). If that function
   * was made global, this could be a regular old system.
   */
  return (entMan) => {
    const WARP_DURATION = 3000;
    let player = entMan.get_player_ent();
    if(!player){
      return;
    }
    if (player.warping_out){
      if(player.warp_timer){
        set_warp_factor(() => gameplay.get_stars(), player.warp_timer);
        player.warp_timer += entMan.delta_time;
        if(player.warp_timer >= WARP_DURATION){
          // CHANGE SYSTEM
          delete player.warping_out;
          let rotation = player.direction;
          let [position, warp_vel] = get_warp_in_position_and_vel(
            player,
            _.player.current_system,
            _.player.selected_system
          );
          console.log(position);
          gameplay.change_system();
          player = entMan.get_player_ent();
          player.velocity = warp_vel;
          player.position = position;
          player.warp_timer = WARP_DURATION;
          // TODO: Rotate player to face direction of travel
          rotate_stars(
            () => gameplay.get_stars(),
            get_direction(player.velocity)
          );
          player.warping_in = true;
        }
      } else {
        player.warp_timer = entMan.delta_time;
        rotate_stars(
          () => gameplay.get_stars(),
          get_direction(player.velocity)
        );
      }
    } else if ( player.warping_in ){
      if(player.warp_timer > 0){
        player.warp_timer -= entMan.delta_time;
        set_warp_factor(() => gameplay.get_stars(), player.warp_timer);
      } else {
        // DONE WARPING
        delete player.warp_timer;
        delete player.warping_in;
        set_warp_factor(() => gameplay.get_stars(), 0);
      } 
    }
  }
}

function set_warp_factor(get_stars, warp_factor){
  const STRETCH = 0.005;
  let star_stretch = 1 + (STRETCH * warp_factor);
  if (_.settings.star_stretching){
    let stars = get_stars();
    if(stars){
      stars.forEach( star => star.width = star_stretch);
    }
  }
}
  
function rotate_stars(get_stars, direction){
  console.log(_.settings);
  if(_.settings.star_stretching){
    let stars = get_stars();
    stars.forEach( (star) => {
      star.angle = direction;
    });
  }
}

function get_warp_in_position_and_vel(entity, origin, dest){
  function invert_x(point){
    // TODO: Why?
    // Is this why the AI is so janked up?
    return {x: point.x * -1, y: point.y/* * -1*/};
    //return point;
  }
  // TODO: Upgrade that lets you appear closer in.
  let origin_coord = invert_x(_.data.systems[origin]);
  let dest_coord = invert_x(_.data.systems[dest]);
  let dir = point_directly_at(dest_coord, origin_coord);
  return [
    rect_from_polar(
      dir,
      WARP_IN_DIST_FACTOR * entity.min_hyperjump_distance,
    ),
    rect_from_polar(
      (dir + Math.PI) % (Math.PI * 2),
      entity.max_speed
    ),
  ];
}
