export function accelerate(velocity, direction, magnitude){
	velocity.x += Math.cos( direction ) * magnitude;
	velocity.y += Math.sin( direction ) * magnitude;
};

export function decelerate(velocity, rate, curve=false){
  let dir = Math.atan2(entity.velocity.y, entity.velocity.x);
  let speed = Math.sqrt( Math.pow(entity.velocity.x, 2)
        + Math.pow(entity.velocity.x, 2) );
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
  for (let ent of entMan.get_with(['velocity', 'position'])) {
    ent.position.x += ent.velocity.x * entMan.delta_time;
    ent.position.y += ent.velocity.y * entMan.delta_time;
  }
};


export function speedLimitSystem(entMan) {
  for (let entity of entMan.get_with(['velocity', 'maxSpeed'])) {
    let dir = Math.atan2(entity.velocity.y, entity.velocity.x);
    if(
        Math.sqrt( Math.pow(entity.velocity.x, 2)
        + Math.pow(entity.velocity.y, 2) )
        > entity.maxSpeed ){
      entity.velocity.x = Math.cos(dir) * entity.maxSpeed;
      entity.velocity.y = Math.sin(dir) * entity.maxSpeed; 
    }
  }
};

