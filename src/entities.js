let SHIP_Z = -2;

export function npcShipFactory(data, type, position, hud, ai, govt){
  let ship = shipFactory(data, type, position);
  ship.ai = ai;
  ship.radar_pip = hud.get_radar_pip(4, '#FF0000FF');
  ship.govt = govt;
  return ship;
}

export function playerShipFactory(data, type, position, camera, hud, player) {

  let ship = shipFactory(data, type, position);

  ship.camera = camera;
  ship.input = true;
  ship.player = true; // Is this a hack?
  ship.player_aligned = true; // Fake gov for player and minions

  ship.radar_pip = hud.get_radar_pip(4, '#00FF00FF');
  ship.fuel = player.fuel;
  return ship;
};

export function shipFactory(data, type, position){
  let ship = Object.create(data.ships[type]);

  ship.model = data.get_mesh(ship.mesh);
  ship.model.visibility = 1;

  ship.position = position;
  ship.direction = 0;
  ship.velocity = {x: 0, y: 0};
  ship.direction_delta = 0;
  // TODO: Properly derive weapon list from equip list
  if( ship.weapons === undefined){
    ship.weapons = [];
  }
  ship.weapons = ship.weapons.map((name) => data.get_weapon(name));
  ship.hittable = true;
  ship.hitpoints = ship.max_hp;
  ship.shields = ship.max_shields;
  ship.collider = {radius: .5};
  ship.fuel = ship.max_fuel;
  return ship;
};

export function planetFactory (data, name, hud){
  let planet = Object.create(data.spobs[name]);
  
  planet.position = {x: planet.x, y: planet.y};
  planet.model = data.get_sprite(data.spobtypes[planet.sType].sprite);
  planet.spob_name = name;
  planet.radar_pip = hud.get_radar_pip(15, "Yellow");
  
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
    'radar_pip': hud.get_radar_pip(5, '#FF00FFFF')
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
          BABYLON.Axis.Z, -1 * entity.direction_delta, BABYLON.Space.LOCAL);
      entity.direction_delta = 0;
    }
  }
};

export function npcSpawnerFactory(data, system, typeset, hud) {
  console.log(system);
  return {
    spawner: true,
    spawns_npc: true,
    min: system.avg_ships || 1,
    govt: system.govt || null,
    types: typeset,
    hud: hud //FIXME: Filthy no good very bad hack
      // some way of getting radar pips without passing
      // HUD around needs to exist, but not today.
  }
}

export function npcSpawnerSystem(entMan) {
  for (let spawner of entMan.get_with(['spawner', 'spawns_npc'])){
    if(count_npcs(entMan) < spawner.min){
      // TODO: Set timer to make this feel more natural
			// TODO: Spawn ships in with a warp transition for coolness

		  	
		  let npc = npcShipFactory(
                                entMan.data,
                                random_type(spawner.types),
                                random_position(),
                                spawner.hud,
                                {state: 'passive'},
                                spawner.govt
      );
      console.log(npc);
      entMan.insert(npc);
		}
  }
}

function count_npcs(entMan){
  // Counts the number of NPC ships in the system
  // If there's a bug with the spawner, it may be that
  // the method for counting has become inaccurate.
  // For example, right now we're just counting the number
  // of entities with an "ai" attribute.

	// To account for player fleets, etc might not be crazy to have a
  // 'native' flag that indicates that a ship was made by a spawner
  // and isn't part of a mission, etc
  return entMan.get_with(['ai']).length;
}

function random_position(z=SHIP_Z){
  let distance = Math.random() * 100;
  let angle = Math.random() * 2 * Math.PI;

  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    z: z
  };
};

function random_type(typeset){
  // A fun StackOverflow post for sure:
  // https://stackoverflow.com/questions/5915096/get-random-item-from-javascript-array	
  return typeset[Math.floor(Math.random() * typeset.length)];
};

