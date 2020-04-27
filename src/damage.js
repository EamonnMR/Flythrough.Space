import { _ } from "./singletons.js";
import {
  do_explo,
  flash_factory,
  set_dark_texture,
  make_way_for_light,
} from "./graphics.js";

import { polar_from_rect } from "./util.js";

import { accelerate } from "./physics.js";

const DISABLED_THRESHOLD = 0.15;

export function shot_handler(shot, object){


  if ('force' in shot && 'mass' in object){
    if(shot.velocity){
      let shot_vel_polar = polar_from_rect(shot.velocity);
      accelerate(object.velocity, shot_vel_polar.angle, -1 * shot.force);
    }  // TODO: Handle force-per-second calculation for beams
    // Also use beam.direction rather than calculating from
    // velocity, since beams have no velocity
  }

  let shield_damage_done = 0;

  if ( 'damage' in shot ){
    let shield_damage_done = damage_handler(shot, object);
  }

  if("recharge_parent_shields"){
    recharge_parent_shields(shield_damage_done, shot.creator);
  }

  if ('remove_on_contact' in shot){
    // An expiring projectile has hit a target - remove it
    shot.remove = true;
  }

  if('explosion' in shot){
    do_explo(shot.position, shot.explosion);
  }

  // Add other special case shot interaction logic here
}

function draw_aggro(damager, damaged){
  if( 'ai' in damaged && 'creator' in damager){
    if ( 'aggro' in damaged.ai ){
      damaged.ai.aggro.push(damager.creator);
    } else {
      damaged.ai.aggro = [ damager.creator ];
    }
  }
}

export function damage_handler(damager, damaged){
  draw_aggro(damager, damaged);
  let shield_damage = 0;
  if ('shield_damage' in damager && 'shields' in damaged){
    shield_damage = dps(damager, damager.shield_damage);
    damaged.shields -= shield_damage;
    if ( damaged.shields >= 0){
      return shield_damage;
    } else if (damaged.shields <= 0){
      damaged.shields = 0;
    }
  }


  if ('damage' in damager && 'hitpoints' in damaged){

    let new_hp = damaged.hitpoints - dps(damager, damager.damage);
    let disabled_thresh = DISABLED_THRESHOLD * damaged.max_hp;  // TODO: Cache per ent
    
    if ("nonlethal" in damager){
      if(new_hp < disabled_thresh){
        damaged.hitpoints = disabled_thresh; 
        disabled(damaged);
      }
    } else {

      damaged.hitpoints = new_hp;

      // If an entity's hitpoints are gone, destroy it
      if(new_hp < disabled_thresh){
        disabled(damaged, _.entities);
      }
      if (new_hp <= 0){
        // TODO: More elaborite death sequence
        destroyed(damaged, _.entities);
      }
    }
  }
}

function destroyed(entity){
  // TODO: Slow explosion filled demise
  // TODO: Size-proportional explosions
  entity.remove = true;
  do_explo(entity.position, entity.explosion, entity.mass);
  let intensity = entity.mass / 5;
  if( _.settings.light_effects && make_way_for_light(intensity)){ 
    _.entities.insert( flash_factory( entity.position, intensity, 300, 750));
  }
  if(_.entities.is_player_ent(entity)){
    _.hud.widgets.alert_box.show("Ship Destroyed");
  }
}

function disabled(entity){
  // TODO: More explosions
  // Maybe a sound effect?
  entity.disabled = true;
  set_dark_texture(entity);
  if(_.entities.is_player_ent(entity)){
    _.hud.widgets.alert_box.show("Ship Disabled");
  }
}

function dps(damager, quantity){
  /* Handle the fact that some shots do damage per second
   */
  if ('damage_per_second' in damager){
    return (quantity / 1000) * _.entities.delta_time;
  }
  if ('scale_damage_with_velocity'){

    let shot_vel_polar = polar_from_rect(damager.velocity);
    return quantity * 100 * shot_vel_polar.magnitude;
  }
  return quantity;
}

function recharge_parent_shields(amount, entity_id){
  let entity = _.entities.get(entity_id);
  if(entity){
    entity.shields += amount;
    if(entity.shields >= entity.max_shields){
      entity.shields = entity.max_shields;
    }
  }
}

export function regenSystem(entMan){
  for(let aspect of ["hp", "shields", "fuel"]){
    for(let entity of entMan.get_with([
      aspect,
      `max_{aspect}`, 
      `aspect{_regen}`
    ])){
      entity[aspect] += entity[aspect + "_regen"];
      if(entity[aspect] > entity["max_" + aspect]){
        entity[aspect] = entity["max_" + aspect];
      }
    }
  }
}

