import { _ } from "./singletons.js";
import {
  do_explo,
  flash_factory,
  set_dark_texture,
  make_way_for_light,
} from "./graphics.js";

const DISABLED_THRESHOLD = 0.15;

export function shot_handler(shot, object){
  if ( 'damage' in shot ){
    damage_handler(shot, object);
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
  if ('shield_damage' in damager && 'shields' in damaged){
    damaged.shields -= dps(damager, damager.shield_damage);
    if ( damaged.shields >= 0){
      return; // Shields prevent hull damage
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
  do_explo(entity.position, entity.explosion);
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
  return quantity;
}

