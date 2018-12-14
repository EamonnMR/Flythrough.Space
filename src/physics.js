export function linear_vel(velocity){
  return Math.sqrt( Math.pow(velocity.x, 2) + Math.pow(velocity.y, 2));
}

export function accelerate(velocity, direction, magnitude){
	velocity.x += Math.cos( direction ) * magnitude;
	velocity.y += Math.sin( direction ) * magnitude;
};

export function decelerate(velocity, rate, curve=false){
  let dir = Math.atan2(velocity.y, velocity.x);
  let speed = linear_vel(velocity);
  if(curve){
    speed = Math.sqrt( speed );
  } else {
    speed = speed - rate;
    if(speed <= 0){
      velocity.x = 0;
      velocity.y = 0;
      return;
    }
  }

  velocity.x = Math.cos(dir) * speed;
  velocity.y = Math.sin(dir) * speed;
}
  

export function rotate(entity, delta) {
	entity.direction = (entity.direction + delta) % (Math.PI * 2);
	if ( entity.direction < 0 ){
		entity.direction += Math.PI * 2
	}
};


export function velocitySystem(entMan){
  // Provides inertia.
  for (let ent of entMan.get_with(['velocity', 'position'])) {
    ent.position.x += ent.velocity.x * entMan.delta_time;
    ent.position.y += ent.velocity.y * entMan.delta_time;
  }
};


export function speedLimitSystem(entMan) {
  // Enforces 'max speed' on entities.
  for (let entity of entMan.get_with(['velocity', 'max_speed'])) {
    let dir = Math.atan2(entity.velocity.y, entity.velocity.x);
    if(linear_vel(entity.velocity) > entity.max_speed ){
      entity.velocity.x = Math.cos(dir) * entity.max_speed;
      entity.velocity.y = Math.sin(dir) * entity.max_speed; 
    }
  }
};

