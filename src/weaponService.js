angular
.module('mainApp')
.service('weaponService', function() {

  const deltaTime = 0.05; //Engine uses a fixed interval I believe.

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

  class Weapon {
    constructor(period, sprite){
      this.timer = 0;
      this.period = period;
    }

    tryShoot(entMan) {
      if(this.timer >= 0) {
        this.timer += this.period;
        console.log('shooting')
      }
    }

    update(entMan, time) {
      if (this.timer > 0){
        this.timer -= time;
      }
      if (this.timer <= 0) {

      }
    }
  }

  return {
    'Weapon': Weapon
  };
});
