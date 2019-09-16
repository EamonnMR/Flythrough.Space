import { do_explo } from "./graphics.js";

const DISABLED_THRESHOLD = 0.15;

export function shot_handler(shot, object){
  if ( 'damage' in shot ){
    damage_handler(shot, object);
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

export function damage_handler(damager, damaged){
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
        damaged.disabled = true;
      }
    } else {

      damaged.hitpoints = new_hp;

      // If an entity's hitpoints are gone, destroy it
      if(new_hp < disabled_thresh){
        damaged.disabled = true;
      }
      if (new_hp <= 0){
        // TODO: More elaborite death sequence
        do_explo(damaged.position);
        damaged.remove = true;
      }
    }
  }
}

