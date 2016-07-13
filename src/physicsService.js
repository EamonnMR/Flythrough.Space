angular
.module('mainApp')
.service('physicsService', function() {

return {

accelerate: function(velocity, direction, magnitude){
	velocity.x += Math.cos( direction ) * magnitude;
	velocity.y += Math.sin( direction ) * magnitude;
},

rotate: function(entity, delta) {
	entity.direction = (entity.direction + delta) % (Math.PI * 2);
	if ( entity.direction < 0 ){
		entity.direction += Math.PI * 2
	}
},

velocitySystem: function(entMan){
  for (let [ id, ent ] in entMan.get_with(['velocity', 'position'])) {
    ent.position.x += ent.velocity.x * entMan.delta_time;
    ent.position.y += ent.velocity.y * entMan.delta_time;
  }
},

speedLimitSystem: function(entMan) {
  for (let id in entMan.entities) {
    if (entMan.entities.hasOwnProperty(id)) {
      let entity = entMan.entities[id];
      if ('velocity' in entity
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
}

};

})
