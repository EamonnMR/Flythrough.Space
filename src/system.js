/* This is sort of the last corner where the code is still being left totally
 pecular produces a highlight color on a
 * rest might be small enogh to move back to GameplaySystem
 *
 * Returns an array of models which 'belong' to the system rather than any
 * ents and need to be cleaned up on system exit.
 */

import { _ } from "./singletons.js";
import { create_starfield, camera_ready } from "./graphics.js"; 

import {
  playerShipFactory,
  npcSpawnerFactory,
  planetFactory
} from "./entities.js"; 

import { random_position } from "./util.js";

export function setup_system(entMan, system){
  
  camera_ready(); 
  let system_dat = _.data.systems[system];

  let ents = [
    playerShipFactory(
        _.player.ship_dat, 
        {
          x: _.player.initial_position.x,
          y: _.player.initial_position.y
        },
    ),
  ];
  if( system_dat.npcs ){
    ents.push(
      npcSpawnerFactory(system_dat)
    );
  }

  // TODO: NPCs should actually be made by an NPC Spawner entity that jumps NPC ships in at random times.


  let planets = [];
  // TODO: Why keep planets list seperate?
  let index = 0;
  if ('spobs' in system_dat) {
    for (let spob_name of system_dat.spobs){
      let spob_dat = _.data.spobs[spob_name];
      let planet = planetFactory(spob_name, index)
      planets.push( planet );
      index++
    }
  }

  return enter_system(entMan, planets, system_dat.lights, ents);
};

function enter_system(entMan, planets, lights, ents) {
  let world_models = []

  for (let light of lights) {
    world_models.push(lightFactory(light));
  }

  let [starfield, stars] = create_starfield()
  world_models = world_models.concat(stars);

  for (let ent of ents) {
    entMan.insert( ent );
  }


  for (let planet of planets) {
    entMan.insert( planet );
  }

  return [world_models, [starfield]];
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
