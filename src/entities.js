import { Weapon } from "./weapon.js";
import { apply_upgrades } from "./util.js";
import {
  create_composite_model,
  create_planet_sprite
} from "./graphics.js";

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
  let ship = Object.create(type);
  ship.position = position;
  ship.direction = 0;
  ship.velocity = {x: 0, y: 0};
  ship.direction_delta = 0;
  ship.hittable = true;
  ship.hitpoints = ship.max_hp;
  ship.shields = ship.max_shields;
  ship.collider = {radius: .5};
  ship.fuel = ship.max_fuel;
  apply_upgrades(ship, ship.upgrades, data);
  create_composite_model(ship, data);
  return ship;
};


export function planetFactory (data, name, hud, scene, index){
  let planet = Object.create(data.spobs[name]);
  
  planet.position = {x: planet.x, y: planet.y};
  planet.model = create_planet_sprite(data, planet, scene); 
  planet.spob_name = name;
  // TODO: Change pip color based on landability status
  planet.radar_pip = hud.get_radar_pip(15, "Yellow");
  
  // For number-key auto selection purposes
  planet.spob_index = index;
  
  return planet;
};


export function asteroidFactory (position, velocity, sprite, hud) {
  // TODO: Asteroids should have some sort of data
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

export function npcSpawnerFactory(data, system, hud) {
  return {
    spawner: true,
    spawns_npc: true,
    min: system.npc_average || 1,
    types: system.npcs,
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

      let group = random_group(spawner.types, entMan.data);
		  let npc = npcShipFactory(
                                entMan.data,
                                random_type(group.ships, entMan.data),
                                random_position(),
                                spawner.hud,
                                {state: 'passive'},
                                group.govt
      );
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

function random_position(){
  let distance = Math.random() * 100;
  let angle = Math.random() * 2 * Math.PI;

  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
  };
};

function random_type(npcs, data){
  // A fun StackOverflow post for sure:
  // https://stackoverflow.com/questions/5915096/get-random-item-from-javascript-array	
  return data.ships[npcs[Math.floor(Math.random() * npcs.length)]];
};

function random_group(groups, data){
  return data.npc_groups[groups[Math.floor(Math.random() * groups.length)]]; 
};


