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

function bulletFactory(position, sprite, direction, speed, initialVelocity,
                       max_age) {
  sprite.position.x = position.x;
  sprite.position.y = position.y;
  sprite.position.z = 0;
  sprite.angle = direction;
  sprite.size = 0.5;
  let velocity = {'x': initialVelocity.x, 'y': initialVelocity.y};
  physics.accelerate(velocity, direction, speed);
  return {
    'position': {'x': position.x, 'y': position.y},
    'model': sprite,
    'velocity': velocity,
    'max_age': max_age,
    'age': 0.0,
    'collider': {'radius': 1}
  };
};

export class Weapon {
  constructor(period, sprite){
    this.timer = 0;
    this.period = period;
    this.sprite = sprite
    this.speed = 0.001
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
                    5000))
    }
  }

  update(entMan) {
    if (this.timer > 0){
      this.timer -= entMan.delta_time;
    }
    //if (this.timer <= 0) {
    //  this.timer = 0
    //}
 }
};

