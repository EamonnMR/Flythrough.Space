import { _ } from "./singletons.js";
import { is_colliding } from "./collision.js"
import { apply_upgrades, random_position, choose } from "./util.js";
import {
  create_composite_model,
  create_planet_sprite,
  create_asteroid_model,
  get_engine_particle_systems,
} from "./graphics.js";

export function fighterFactory(type, mothership){
  let ship = shipFactory(
    type,
    {
      x: mothership.position.x,
      y: mothership.position.y,
    },
    mothership.govt ? mothership.govt : null
  );
  ship.ai = {"state": "passive"};
  if(mothership.ai && "aggro" in mothership.ai){
    ship.ai.aggro = mothership.ai.aggro;
  }
  ship.mothership = mothership.id;
  ship.radar_pip = _.hud.widgets.radar_box.get_pip(4, mothership.player ?
    "#00FF00FF" : "#FF0000FF"
  );
  ship.overlay = _.hud.get_overlay_texture(ship);
  if(mothership.player_aligned){
    ship.player_aligned = true;
  }
  return ship;
}

export function npcShipFactory(type, position, ai, govt){
  let ship = shipFactory(type, position, govt);
  ship.ai = ai;
  ship.radar_pip = _.hud.widgets.radar_box.get_pip(4, '#FF0000FF');
  ship.overlay = _.hud.get_overlay_texture(ship);
  return ship;
}

export function playerShipFactory(type, position) {

  let ship = shipFactory(type, position);

  ship.camera = true;
  ship.input = true;
  ship.player = true; // Is this a hack?
  ship.player_aligned = true; // Fake gov for player and minions

  // TODO: Gate this behind a difficulty mode of some kind

  ship.accel = ship.accel  * 1.25;
  ship.max_speed = ship.max_speed * 1.25;

  ship.radar_pip = _.hud.widgets.radar_box.get_pip(4, '#00FF00FF');
  ship.fuel = _.player.fuel;
  return ship;
};

export function shipFactory(type, position, govt=null){
  let ship = Object.create(type);
  if(govt){
    ship.govt = govt;
  }
  ship.position = position;
  ship.direction = 0;
  ship.velocity = {x: 0, y: 0};
  ship.direction_delta = 0;
  ship.hittable = true;
  ship.hitpoints = ship.max_hp;
  ship.shields = ship.max_shields;
  ship.collider = {radius: 2};
  ship.fuel = ship.max_fuel;
  ship.thrusting = false;
  apply_upgrades(ship, ship.upgrades);
  create_composite_model(ship, govt);
  ship.engine_trails = get_engine_particle_systems(ship);
  return ship;
};


export function planetFactory (name, index){

  let planet = Object.create(_.data.spobs[name]);
  // Scale
  planet.x = planet.x / 3;
  planet.y = planet.y / 3;
  
  planet.position = {x: planet.x, y: planet.y};
  planet.model = create_planet_sprite(planet); 
  planet.spob_name = name;
  // TODO: Change pip color based on landability status
  planet.radar_pip = _.hud.widgets.radar_box.get_pip(10, "Yellow");
  
  // For number-key auto selection purposes
  planet.spob_index = index;
  
  return planet;
};


export function asteroidFactory (type, position, velocity) {
  let asteroid = Object.create(_.data.asteroids.types[type])
  asteroid["team-asteroids"] = true;
  asteroid.collider = {'radius': 1};
  if(asteroid.hitpoints){
    asteroid.hittable = true
  }
  asteroid.position = {x: position.x, y: position.y};
  asteroid.velocity = {x: velocity.x, y: velocity.y};
  asteroid.max_speed = 0.015;
  asteroid.radar_pip = _.hud.widgets.radar_box.get_pip(3, 'brown');
  create_asteroid_model(asteroid);
  return asteroid;
};

export function npcSpawnerFactory(system) {
  return {
    spawner: true,
    spawns_npc: true,
    min: system.npc_average || 1,
    types: system.npcs,
  }
}

export function npcSpawnerSystem(entMan) {
  for (let spawner of entMan.get_with(['spawner', 'spawns_npc'])){
    if(count_npcs(entMan) < spawner.min){
      // TODO: Set timer to make this feel more natural
			// TODO: Spawn ships in with a warp transition for coolness

      let group = _.data.npc_groups[choose(spawner.types)];
      console.log(group);
		  let npc = npcShipFactory(
                                random_type(group.ships),
                                random_position(),
                                {state: 'passive'},
                                group.govt
      );
      npc.spawn_system_created = true;
      npc.money = Math.round(npc.price / 10);
      if("money" in group){
        npc.money = group.money;
      }
      if("cargo" in group){
        npc.cargo_carried[choose(group.cargo)] = Math.round(Math.random() * npc.cargo);
      }
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
  return entMan.get_with(['ai', 'spawn_system_created']).length;
}

function random_type(npcs){
  // A fun StackOverflow post for sure:
  // https://stackoverflow.com/questions/5915096/get-random-item-from-javascript-array	
  let type = choose(npcs);
  if (type in _.data.ships){
    return _.data.ships[type];
  } else {
    console.log("Data Error: Ship '" + type + "' does not exist.");
    // Yeah, this will go infinite if you've got all undefined ships in a group
    return random_type(npcs);
  }
};

export function pickupSystem(entMan){
  for(let picker_upper of entMan.get_with(["can_pickup"])){
    for(let picked_up of entMan.get_with(["pickup_cargo"])){
      if(is_colliding(picker_upper, picked_up)){
        if(_.entities.is_player_ent(picker_upper)){
          for(let cargo_type of Object.keys(picked_up.pickup_cargo)){
            let taken = _.player.fill_cargo(
              cargo_type,
              picked_up.pickup_cargo[cargo_type]
            );
            if (taken) {
              console.log(`Picked up ${taken} tons of ${cargo_type}`);
              picked_up.remove = true;
            }
          }
        }
      }
    }
  }
}
