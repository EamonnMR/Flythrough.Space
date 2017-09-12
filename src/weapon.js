import * as physics from "physics";

export function weaponSystem (entMan) {
  for (let entity of entMan.get_with(['weapons'])) {
    if ('weapons' in entity) {
      for (let weapon of entity.weapons) {
        weapon.update(entMan);
      }
    }
  }
};
  
export function decaySystem (entMan) {
  for (let entity of entMan.get_with(['age', 'maxage'])) {
    if ( 'age' in entity && 'max_age' in entity ) {
      entity.age += entMan.delta_time;
      if ( entity.age > entity.max_age ) {
        entity.remove = true;
      }
    }
  }
};

function bulletFactory(position, sprite, direction, speed, initialVelocity, proto, ignore_gov) {
  sprite.position.x = position.x;
  sprite.position.y = position.y;
  sprite.position.z = 0;
  sprite.angle = direction;
  sprite.size = 0.5;
  let velocity = {'x': initialVelocity.x, 'y': initialVelocity.y};
  physics.accelerate(velocity, direction, speed);

  let shot = Object.create(proto);

  shot.position = {x: position.x, y: position.y}; // TODO: es6 clone?
  shot.model = sprite;
  shot.velocity = velocity;
  shot.age = 0.0;

  shot.ignoregov = ignore_gov;
  shot.shot = true; // Could we also derive from an ur-shot object?
  if (!("remove_on_contact" in shot)){
    shot.remove_on_contact = true;
  }

  return shot;

};

export class Weapon {
  constructor(period, sprite, projectile, velocity){
    this.timer = 0;
    this.period = period;
    this.sprite = sprite;
    this.speed = velocity;
    this.projectile = projectile;
  }

  tryShoot(entMan, entity) {
    if(this.timer <= 0) {
      this.timer += this.period;
      entMan.insert(bulletFactory(
                    entity.position,
                    new BABYLON.Sprite("bullet", this.sprite),
                    entity.direction,
                    this.speed,
                    entity.velocity || {'x': 0, 'y': 0},
                    this.projectile,
                    'govt' in entity ? entity.govt : null))
    }
  }

  update(entMan) {
    if (this.timer > 0){
      this.timer -= entMan.delta_time;
    }
 }
};

