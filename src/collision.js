export function distance(l_pos, r_pos){
  return Math.sqrt(
    Math.pow(l_pos.x - r_pos.x, 2)
    + Math.pow(l_pos.y - r_pos.y, 2)
  );
};

export function collisionDetectionSystem(entMan){
  let colliders = entMan.get_with(['collider', 'position'])
  while (colliders.length > 1) {
    let current = colliders.pop();
    for (let other of colliders) {
      let dist = distance(current.position, other.position);
      if ( dist < current.collider.radius + other.collider.radius) {
        // Do something with the collision 
        console.log('Colliding: ' + current.id + ', ' + other.id);
      }
    }
  }
};

