import { _ } from "./singletons.js";
import {
  do_explo,
  flash_factory,
  set_dark_texture,
  make_way_for_light,
} from "./graphics.js";

import {
  asteroidFactory
} from "./entities.js";

import {
  vector_plus,
  random_position
} from "./util.js";

import { polar_from_rect } from "./util.js";

import { accelerate } from "./physics.js";

const DISABLED_THRESHOLD = 0.15;

export function shot_handler(shot, object){


  if ('force' in shot && 'mass' in object){
    force_handler(shot, object);
  }

  let shield_damage_done = 0;

  if ( 'damage' in shot ){
    shield_damage_done = damage_handler(shot, object);
  }

  if("recharge_parent_shields" in shot && shield_damage_done ){
    recharge_parent_shields(
      shield_damage_done,
      shot.creator
    );
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
        disabled(damaged);
      }
      if (new_hp <= 0){
        // TODO: More elaborite death sequence
        destroyed(damaged, damager);
      }
    }
  }
}

function destroyed(entity, killshot){
  // TODO: Slow explosion filled demise
  entity.remove = true;
  do_explo(entity.position, entity.explosion, entity.mass);
  // TODO: Once AOE exists, do AOE things
  let intensity = entity.mass / 5;
  if( _.settings.light_effects && make_way_for_light(intensity)){ 
    _.entities.insert( flash_factory( entity.position, intensity, 300, 750));
  }
  
  if("drops" in entity){
    for(let type of Object.keys(entity.drops)){
      for(let _i = 0; _i < entity.drops[type]; _i++){
        _.entities.insert(
          asteroidFactory(
            type,
            entity.position,
            vector_plus(
              entity.velocity,
              random_position(0.01),
            )
          )
        )
      }
    }
  }

  if(_.entities.is_player_ent(entity)){
    _.hud.widgets.alert_box.show("Ship Destroyed");
  }
  let creator = _.entities.get(killshot.creator);
  if(creator.player_aligned){
    if(entity.price){
      _.player.total_accumulated_damage += entity.price;
    }
    if(entity.govt){
      _.player.destroyed_ship_of_govt(entity.govt);
    }
  }
}

function force_handler(shot, object){
  if(shot.velocity){
    let shot_vel_polar = polar_from_rect(shot.velocity);
    accelerate(object.velocity, shot_vel_polar.angle, -1 * (shot.force / object.mass));
  } else if (shot.direction){
    accelerate(object.velocity, shot.direction, ((shot.force / object.mass) / 1000) * _.entities.delta_time);

    let parent = _.entities.get(shot.creator);
    if(parent){
      accelerate(parent.velocity, shot.direction, ((shot.force / parent.mass) / -1000) * _.entities.delta_time);
    }
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
  if ('scale_damage_with_velocity' in damager){

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

