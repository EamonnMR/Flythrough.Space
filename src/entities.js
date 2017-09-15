export function radar_pip_factory(hud, color='#5000FFFF'){
  return new BABYLON.Ellipse2D({
    parent: hud.canvas, id: 'pip_for' + name,
    width: 5, height: 5, x: 0, y: 0,
    fill: BABYLON.Canvas2D.GetSolidColorBrushFromHex(color)
  });
}

export function npcShipFactory(data, type, position, hud, ai, govt){
  let ship = shipFactory(data, type, position);
  ship.ai = ai;
  ship.radar_pip = radar_pip_factory(hud, '#FF0000FF');
  ship.govt = govt;
  return ship;
}

export function playerShipFactory(data, type, position, camera, hud) {

  let ship = shipFactory(data, type, position);

  ship.camera = camera;
  ship.input = true;
  ship.player = true; // Is this a hack?
  ship.player_aligned = true; // Fake gov for player and minions

  ship.radar_pip = radar_pip_factory(hud, '#00FF00FF');
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

  ship.weapons = ship.weapons.map((name) => data.get_weapon(name));
  ship.hittable = true;
  ship.hitpoints = 1;
  ship.collider = {radius: .5};
  return ship;
};

export function planetFactory (data, name, hud){
  let planet = Object.create(data.spobs[name]);
  
  planet.position = {x: planet.x, y: planet.y};
  planet.model = data.get_sprite(data.spobtypes[planet.sType].sprite);
  planet.spob_name = name;
  planet.radar_pip = radar_pip_factory(hud);
  
  return planet;
};


export function asteroidFactory (position, velocity, sprite, hud) {
  sprite.position.x = position.x;
  sprite.position.y = position.y;
  sprite.position.z = position.z;
  return {
    'team-asteroids': true,
    'position': {'x': position.x, 'y': position.y },
    'velocity': velocity,
    'model': sprite,
    'hitpoints': 10,
    'collider': {'radius': .5},
    'hittable': true,
    'radar_pip': radar_pip_factory(hud, '#FF00FFFF')
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
      // Would it be possible to get it such that
      // entity.position === entity.model.position?
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

