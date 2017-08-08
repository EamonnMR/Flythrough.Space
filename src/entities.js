export function radar_pip_factory(id, hud){
  return new BABYLON.Ellipse2D({
    parent: hud.canvas, id: 'pip_for' + name,
    width: 5, height: 5, x: 0, y: 0,
    fill: BABYLON.Canvas2D.GetSolidColorBrushFromHex('#5000FFFF')
  });
}

export function playerShipFactory(data, type, position, camera, weapons, hud) {

  let ship = shipFactory(data, type, position);

  ship.weapons = weapons;
  ship.camera = camera;
  ship.input = true;

  return ship;
};

export function shipFactory(data, type, position){
  let ship = Object.create(data.ships[type]);

  ship.model = data.get_mesh(ship.mesh);
  ship.model.rotate(BABYLON.Axis.Y, -Math.PI/2, BABYLON.Space.LOCAL);
  ship.model.visibility = 1;

  ship.position = position;
  ship.direction = 0;
  ship.velocity = {x: 0, y: 0};
  ship.direction_delta = 0;
  ship.radar_pip = radar_pip_factory(player, hud);

  return ship;
}

export function planetFactory (position, size,
    sprite, name, hud) {
  // Deep copy the position
  sprite.position.x = position.x;
  sprite.position.y = position.y;
  sprite.position.z = position.z;
  
  return {
    'position': {'x': position.x, 'y': position.y},
    'model': sprite,
    'spob_name': name,
    'radar_pip': radar_pip_factory('pip_for_' + name, hud)
  };
};


export function asteroidFactory (position, velocity, sprite) {
  sprite.position.x = position.x;
  sprite.position.y = position.y;
  sprite.position.z = 0;
  return {
    'position': {'x': position.x, 'y': position.y },
    'velocity': {'x': velocity.x, 'y': velocity.y },
    'model': sprite,
    'hitpoints': 10,
    'collider': {'radius': .5},
    'hittable': true
  };
};

export function cameraFollowSystem (entMan) {
  for (let entity of entMan.get_with(['position', 'camera'])) {
    entity.camera.position.x = entity.position.x;
    entity.camera.position.y = entity.position.y;
  }
};

export function modelPositionSystem (entMan) {
  for (let entity of entMan.get_with(['model'])) {
    if ('position' in entity) {
      entity.model.position.x = entity.position.x;
      entity.model.position.y = entity.position.y;
    }
    if ('direction' in entity) {
      entity.model.rotate(
          BABYLON.Axis.Y, entity.direction_delta, BABYLON.Space.LOCAL);
      entity.direction_delta = 0;
    }
  }
};

