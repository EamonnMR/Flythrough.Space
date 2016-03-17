angular
.module('mainApp')
.service('weaponService', function() {

  function weaponService (entMan) {
    for (let id in entMan.entities) {
      if (entMan.entities.hasOwnProperty(id)) {
        let entity = entMan.entities[id];
        if ('weapons' in entity) {
          weapons.update()
        }
      }
    }
  };

  function bulletFactory(position, sprite, direction, speed, initialVelocity) {
      sprite.position.x = position.x;
      sprite.position.y = position.y;
      sprite.position.z = 0;
      // TODO: Rotate the sprites to face 'direction' - is this possible?
      return {
        'position': {'x': position.x, 'y': position.y},
        'model': sprite,
        'velocity': {
          'x': (Math.cos( direction ) * speed) + initialVelocity.x,
        	'y': (Math.sin( direction ) * speed) + initialVelocity.y
        }
      };
  };

  class Weapon {
    constructor(period, sprite){
      this.timer = 0;
      this.period = period;
      this.sprite = sprite
      this.speed = 0.001
    }

    tryShoot(entMan, entity) {
      if(this.timer >= 0) {
        this.timer += this.period;
        entMan.insert(bulletFactory(entity.position,
                                    new BABYLON.Sprite("bullet", this.sprite),
                                    entity.direction,
                                    this.speed,
                                    entity.velocity || {'x': 0, 'y': 0}))
      }
    }

    update(entMan) {
      if (this.timer > 0){
        this.timer -= entMan.delta_time;
      }
      if (this.timer <= 0) {

      }
    }
  }

  return {
    'Weapon': Weapon
  };
});
