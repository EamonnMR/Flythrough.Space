/* This is sort of the last corner where the code is still being left totally
 * messy. A bunch of this needs to be broken out into loader code, and the
 * rest might be small enogh to move back to GameplaySystem
 *
 * Returns an array of models which 'belong' to the system rather than any
 * ents and need to be cleaned up on system exit.
 */

import {
  playerShipFactory,
  npcSpawnerFactory,
  planetFactory
} from "./entities.js"; 

export function setup_system(scene, camera, entMan, system, hud, data, player_data){
  player_data.explore_system(system);
  let system_dat = data.systems[system];

  let lights = [
    {
      type: "hemi",
      x: 0, y: 1, z: 0,
      intensity: .5
    }
  ]
  
  if (system_dat.lights){
    lights = system_dat.lights;
  }


  let ents = [
    playerShipFactory( data,
        player_data.ship_dat, 
        {
          x: player_data.initial_position.x,
          y: player_data.initial_position.y
        },
        camera,
        hud,
        player_data
    ),
  ];
  if( system_dat.npcs ){
    ents.push(
      npcSpawnerFactory(data, system_dat, hud)
    );
  }

  // TODO: NPCs should actually be made by an NPC Spawner entity that jumps NPC ships in at random times.


  let planets = [];
  // TODO: Why keep planets list seperate?
  let index = 0;
  if ('spobs' in system_dat) {
    for (let spob_name of system_dat.spobs){
      let spob_dat = data.spobs[spob_name];
      let planet = planetFactory(data, spob_name, hud, scene, index)
      planets.push( planet );
      index++
    }
  }

  return enter_system(scene, entMan, planets, lights, ents);
};


function enter_system(scene, entMan, planets, lights, ents) {
  let world_models = []

  for (let light of lights) {
    world_models.push(lightFactory(light, scene));
  }

  for (let ent of ents) {
    entMan.insert( ent );
  }


  for (let planet of planets) {
    entMan.insert( planet );
  }

  return world_models;
};

function lightFactory(data, scene){
  let light = null 
  if(data.type = "hemi"){
    light = new BABYLON.HemisphericLight(
        "",
        new BABYLON.Vector3(data.x, data.y, data.z),
        scene
    );
  } else {
    light = new BABYLON.DirectionalLight(
      "",
      new BABYLON.Vector3(data.x, data.y, data.z),
      scene
    ); 
  }

  light.intensity = data.intensity;
  
  return light;
}
