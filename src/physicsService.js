angular
.module('mainApp')
.service('physicsService', function() {

const deltaTime = 0.05; //Engine uses a fixed interval I believe.

function accelerate(velocity, direction, magnitude){
	velocity.x += Math.cos( direction ) * magnitude;
	velocity.y += Math.sin( direction ) * magnitude;
};

function velocitySystem(object){
  for (let id in entMan.entities) {
    if (entMan.entities.hasOwnProperty(id)) {
      let entity = entMan.entities[id];
      if ('velocity' in entity
          && 'position' in entity) {
          object.position.x += object.velocity.x * deltaTime;
          object.position.y += object.velocity.y * deltaTime;
      }
    }
  }
};

function speedLimitSystem(entMan) {
  for (let id in entMan.entities) {
    if (entMan.entities.hasOwnProperty(id)) {
      let entity = entMan.entities[id];
      if ('velocity' in entity
          && 'position' in entity
          && 'maxSpeed') {
        let dir = Math.atan2(entity.velocity.x, entity.velocity.y);
        if(
            Math.sqrt( Math.pow(entity.velocity.x, 2)
            + Math.pow(entity.velocity.x) )
            > entity.maxSpeed ){
          entity.velocity = Math.cos(dir) * entity.maxSpeed;
          entity.velocity = Math.sin(dir) * entity.maxSpeed;
        }
      }
    }
  }
};

})
