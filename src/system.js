/* This is sort of the last corner where the code is still being left totally
 pecular produces a highlight color on a
 * rest might be small enogh to move back to GameplaySystem
 *
 * Returns an array of models which 'belong' to the system rather than any
 * ents and need to be cleaned up on system exit.
 */

import { _ } from "./singletons.js";

import {
  playerShipFactory,
  npcSpawnerFactory,
  planetFactory
} from "./entities.js"; 

export function setup_system(entMan, system, hud){
  _.player.explore_system(system);
  let system_dat = _.data.systems[system];

  let lights = [
    {
      type: "hemi",
      position: [0,1,0],
      intensity: .5
    }
  ]
  
  if (system_dat.lights){
    lights = system_dat.lights;
  }


  let ents = [
    playerShipFactory(
        _.player.ship_dat, 
        {
          x: _.player.initial_position.x,
          y: _.player.initial_position.y
        },
        hud,
    ),
  ];
  if( system_dat.npcs ){
    ents.push(
      npcSpawnerFactory(system_dat, hud)
    );
  }

  // TODO: NPCs should actually be made by an NPC Spawner entity that jumps NPC ships in at random times.


  let planets = [];
  // TODO: Why keep planets list seperate?
  let index = 0;
  if ('spobs' in system_dat) {
    for (let spob_name of system_dat.spobs){
      let spob_dat = _.data.spobs[spob_name];
      let planet = planetFactory(spob_name, hud, index)
      planets.push( planet );
      index++
    }
  }

  return enter_system(entMan, planets, lights, ents);
};


function enter_system(entMan, planets, lights, ents) {
  let world_models = []

  for (let light of lights) {
    world_models.push(lightFactory(light));
  }

  for (let ent of ents) {
    entMan.insert( ent );
  }


  for (let planet of planets) {
    entMan.insert( planet );
  }

  return world_models;
};

function lightFactory(data){
  let light = null 
  if(data.type = "hemi"){
    // Useful nebula-adjacent systems where there's an ambient background

    light = new BABYLON.HemisphericLight(
        "",
        new BABYLON.Vector3(...data.position),
        _.scene
    );
  } else {
    light = new BABYLON.DirectionalLight(
      "",
      new BABYLON.Vector3(...data.position),
      _.scene
    ); 
  }

  if(data.diffuse){
    light.diffuse = new BABYLON.Color3(...data.diffuse);
  }

  if(data.specular){
    light.specular = new BABYLON.Color3(...data.specular);
  }

  if(data.obverse){
    // Only matters for hemi lights
    light.groundColor = new BABYLON.Color3(...data.obverse);
  }

  light.intensity = data.intensity;
  
  return light;
}
