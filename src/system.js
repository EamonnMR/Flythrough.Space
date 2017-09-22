/* This is sort of the last corner where the code is still being left totally
 * messy. A bunch of this needs to be broken out into loader code, and the
 * rest might be small enogh to move back to GameplaySystem
 *
 * Returns an array of models which 'belong' to the system rather than any
 * ents and need to be cleaned up on system exit.
 */


export function setup_system(scene, camera, entMan, system, hud, data){
  let system_dat = data.systems[system];

  let lights = [
    {
      'name': 'sun',
      'pos': {x: 0, y: 1, z: 0},
      'intensity': .5
    }
  ]
  
  if (system_dat.lights){
    lights = system_dat.lights;
  }


  let ents = [
    entities.playerShipFactory( data, "shuttle", 
        {x: 0, y:-1, z: -2}, camera, hud),
  ];
  if( system_dat.govt ){
    ents.push(
      entities.npcSpawnerFactory( data, system_dat, ['shuttle'], hud)
    );
  }

  // TODO: NPCs should actually be made by an NPC Spawner entity that jumps NPC ships in at random times.


  let planets = [];
  // TODO: Why keep planets list seperate?
  if ('spobs' in system_dat) {
    for (let spob_name of system_dat.spobs){
      let spob_dat = data.spobs[spob_name];
      let planetSprite = data.get_sprite("redplanet");
      let planet = entities.planetFactory(data, spob_name, hud)
      planets.push( planet );
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
  let light = new BABYLON.HemisphericLight(data.name,
      new BABYLON.Vector3(data.pos.x, data.pos.y, data.pos.z),
      scene
  );

  light.intensity = data.intensity;
  
  return light;
}
