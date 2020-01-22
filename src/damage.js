import { _ } from "./singletons.js";
import {
  do_explo,
  flash_factory,
  set_dark_texture
} from "./graphics.js";

const DISABLED_THRESHOLD = 0.15;

export function shot_handler(shot, object, entMan){
  if ( 'damage' in shot ){
    damage_handler(shot, object, entMan);
  }

  if ('remove_on_contact' in shot){
    // An expiring projectile has hit a target - remove it
    shot.remove = true;
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

export function damage_handler(damager, damaged, entMan){
  draw_aggro(damager, damaged);
  // A projectile or some such has hit something hittable
  if ('shield_damage' in damager && 'shields' in damaged){
    damaged.shields -= damager.shield_damage;
    if ( damaged.shields >= 0){
      return; // Shields prevent hull damage
    } else if (damaged.shields <= 0){
      damaged.shields = 0;
    }
  }

  if ('damage' in damager && 'hitpoints' in damaged){
    // Remove hitpoints equal to the damage done

    let new_hp = damaged.hitpoints - damager.damage;
    let disabled_thresh = DISABLED_THRESHOLD * damaged.max_hp;  // TODO: Cache per ent
    
    if ("nonlethal" in damager){
      if(new_hp < disabled_thresh){
        damaged.hitpoints = disabled_thresh; 
        disabled(damaged, entMan);
      }
    } else {

      damaged.hitpoints = new_hp;

      // If an entity's hitpoints are gone, destroy it
      if(new_hp < disabled_thresh){
        disabled(damaged, entMan);
      }
      if (new_hp <= 0){
        // TODO: More elaborite death sequence
        destroyed(damaged, entMan);
      }
    }
  }
}

function destroyed(entity, entMan){
  // TODO: Slow explosion filled demise
  // TODO: Size-proportional explosions
  entity.remove = true;
  do_explo(entity.position);
  if( _.settings.light_effects ){ 
    entMan.insert( flash_factory( entity.position, 1, 300, 750));
  }
  if(entMan.is_player_ent(entity)){
    _.hud.widgets.alert_box.show("Ship Destroyed");
  }
}

function disabled(entity, entMan){
  // TODO: More explosions
  // Maybe a sound effect?
  entity.disabled = true;
  set_dark_texture(entity);
  if(entMan.is_player_ent(entity)){
    _.hud.widgets.alert_box.show("Ship Disabled");
  }
}
