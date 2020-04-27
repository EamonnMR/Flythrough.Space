import { accelerate } from "./physics.js";
import { _ } from "./singletons.js"; 
import {
  get_sprite_manager,
} from "./graphics.js";
import {
  world_position_from_model,
} from "./graph_util.js";
import { get_beam } from "./beam_graphics.js";
import { angle_mod } from "./util.js";

export function decaySystem (entMan) {
  /* A system for adding expiration times to entities.
   * Used to make projectiles go away.
   */
  for (let entity of entMan.get_with(['age', 'max_age'])) {
    entity.age += entMan.delta_time;
    if ( entity.age > entity.max_age ) {
      entity.remove = true;
    }
  }
};

function beamFactory(proto, creator, position, direction, govt, player_aligned){
  let beam = Object.assign(Object.create(proto), {
    damage_per_second: true,
    shot: true,
    position: position,
    direction: direction,
    direction_delta: -1 * direction,
    creator: creator,
    collider: {
      length: proto.length
    },
    model: get_beam(proto.graphics, proto.length),
    max_age: 200, // TODO: Find the right number.
    age: 0.0,
  });
  if(govt){
    beam.ignoregov = govt;
  }
  if(player_aligned){
    beam.ignore_player = true;
  }
  return beam;
}

function bulletFactory(creator, position, sprite, direction, speed, initialVelocity, proto, ignore_gov, ignore_player, target) {
  sprite.angle = direction;
  sprite.y = -2;
  // TODO: Get the Y offset based on the depth of the bone
  let velocity = {}
  if(_.settings.arcade_physics){
    velocity = {x: 0, y: 0}
  } else {
    velocity = {x: initialVelocity.x, y: initialVelocity.y};
  }
  accelerate(velocity, direction, speed);

  let shot = Object.create(proto);

  shot.creator = creator;

  shot.position = {x: position.x, y: position.y}; // TODO: es6 clone?
  shot.previous_position = shot.position;
  shot.model = sprite;
  shot.velocity = velocity;
  shot.age = 0.0;
  shot.direction = direction;
  
  if( 'guided' in shot && target){
    shot.guided_target = target;
  }

  // Lag prevention measure.
  if(! 'max_age' in shot){
    shot.max_age = 1000;
  }


  // These are effectively default fields... could object.proto somehow
  // add defaults?

  if(ignore_gov != null){
    shot.ignoregov = ignore_gov;
  }
  if(ignore_player != null){
    shot.ignore_player = ignore_player;
  }
  shot.shot = true; // Could we also derive from an ur-shot object?
  if (!("remove_on_contact" in shot)){
    shot.remove_on_contact = true;
  }

  return shot;

};

export function weapon_factory(proto) {
  let weapon = Object.create(proto);
  weapon.timer = 0;
  weapon.burst_timer = 0;
  weapon.burst_counter = 0;
  weapon.sprite_mgr = get_sprite_manager(weapon.sprite);
  weapon.model = null; // To be filled in elsewhere TODO: gross
  return weapon;
}


function consume_ammo(weapon, entity){
  if("ammo" in weapon){
    if(weapon.ammo in entity.upgrades && entity.upgrades[weapon.ammo] > 0){
      entity.upgrades[weapon.ammo] -= 1;
      return true;
    } else {
      return false;
    }
  } else {
    return true
  }
}

function weapon_can_fire(weapon, entity){
  /*
   * Handles weapon cooldown, burst timers, ammo consumption
   * Returns a boolean determining if it can fire, and causes
   * S I D E   E F F E C T S on the target entity and weapon.
   */

  if(weapon.timer <= 0 && weapon.burst_timer <= 0) {
    weapon.timer += weapon.period;
    if (weapon.burst_period){
      // Only consume ammo for burst weapons at the start of a burst.
      if(weapon.burst_counter == 0){
        if (!consume_ammo(weapon, entity)){
          // We're out of ammo, no need to mess with the timer
          return false;
        }
      }
      weapon.burst_counter += 1;
      if (weapon.burst_counter > weapon.burst_size){
        weapon.burst_timer += weapon.burst_period;
        weapon.burst_counter = 0;
        return false;
      } else {
        return true;
      }
    } else {
      return consume_ammo(weapon, entity);
    }
  } else {
    return false;
  }
}


function fire_weapon(weapon, entity, entMan) {
  if(weapon_can_fire(weapon, entity)){

    let origin = entity.position;
    let depth = -2; // TODO: import SHIP_Z from graphics.js
    let govt = 'govt' in entity ? entity.govt : null;
    let player_aligned = 'player_aligned' in entity;
    let aim_direction = entity.direction;
    if(weapon.model){
      [origin, depth, aim_direction] = world_position_from_model(weapon.model);
    }
    let direction = inaccuracy(
      aim_direction,
      weapon.inaccuracy || 0.0
    );

    if (weapon.proj){
      entMan.insert(bulletFactory(
                    entity.id,
                    origin,
                    new BABYLON.Sprite("bullet", weapon.sprite_mgr),
                    direction,
                    weapon.velocity,
                    entity.velocity || {'x': 0, 'y': 0},
                    weapon.proj,
                    govt,
                    player_aligned,
                    entity.target,
      ));
    }
    if (weapon.beam){
      entMan.insert(beamFactory(
        weapon.beam,
        entity.id,
        origin,
        direction,
        govt,
        player_aligned,
      ));
    }
  }
}

export function weaponSystem (entMan) {
  for (let entity of entMan.get_with(['weapons', "turrets"])) {

    let shoot_primary = 'shoot_primary' in entity;
    delete entity.shoot_primary;

    for (let weapon of entity.weapons) {
      if (weapon.timer > 0){
        weapon.timer -= entMan.delta_time;
      }
      if (weapon.burst_timer > 0){
        weapon.burst_timer -= entMan.delta_time;
      }
      if(shoot_primary){
        fire_weapon(weapon, entity, entMan);
      }
    }
  }
};

function inaccuracy(direction, inaccuracy){
  return angle_mod(direction + inaccuracy * (Math.random() - 0.5));
}
 
