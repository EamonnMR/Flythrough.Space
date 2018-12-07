import { accelerate } from "./physics.js";
 
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

function bulletFactory(creator, position, sprite, direction, speed, initialVelocity, proto, ignore_gov, ignore_player) {
  sprite.angle = direction;
  sprite.y = -2;
  // TODO: Get the Y offset based on the depth of the bone
  let velocity = {'x': initialVelocity.x, 'y': initialVelocity.y};
  accelerate(velocity, direction, speed);

  let shot = Object.create(proto);

  shot.creator = creator;

  shot.position = {x: position.x, y: position.y}; // TODO: es6 clone?
  shot.model = sprite;
  shot.velocity = velocity;
  shot.age = 0.0;
  
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

export function weapon_factory(proto, data) {
  let weapon = Object.create(proto);
  weapon.timer = 0;
  weapon.burst_timer = 0;
  weapon.sprite_mgr = data.get_sprite_mgr(weapon.sprite);
  weapon.model = null; // To be filled in elsewhere TODO: gross
  return weapon;
}

function fire_weapon(weapon, entity, entMan) {
  if(weapon.timer <= 0) {
    weapon.timer += weapon.period;
    if (weapon.proj){
      entMan.insert(bulletFactory(
                    entity.id,
                    entity.position,
                    new BABYLON.Sprite("bullet", weapon.sprite_mgr),
                    (entity.direction + weapon.inaccuracy * (Math.random() - 0.5)) % (Math.PI * 2),
                    weapon.velocity,
                    entity.velocity || {'x': 0, 'y': 0},
                    weapon.proj,
                    'govt' in entity ? entity.govt : null,
                    'player_aligned' in entity));
    }
    // TODO: Handle beams or any other type of weapon
  }
}
  
function random_dir(direction, inaccuracy){
  return (
    direction + inaccuracy * (Math.random() - 0.5)
  ) % (Math.PI * 2);
}

export function weaponSystem (entMan) {
  for (let entity of entMan.get_with(['weapons'])) {

    let shoot_primary = 'shoot_primary' in entity;
    delete entity.shoot_primary;

    for (let weapon of entity.weapons) {
      if (weapon.timer > 0){
        weapon.timer -= entMan.delta_time;
      }
      if(shoot_primary){
        fire_weapon(weapon, entity, entMan);
      }
    }
  }
};
 
