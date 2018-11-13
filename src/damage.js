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

export function damage_handler(damager, damaged){
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
    }
    // Remove hitpoints equal to the damage done
    damaged.hitpoints -= damager.damage;

    // If an entity's hitpoints are gone, destroy it
    if (damaged.hitpoints <= 0){
      damaged.remove = true;
  }
}

