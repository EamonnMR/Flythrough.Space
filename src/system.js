/* This is sort of the last corner where the code is still being left totally
 * messy. A bunch of this needs to be broken out into loader code, and the
 * rest might be small enogh to move back to GameplaySystem
 *
 * Returns an array of models which 'belong' to the system rather than any
 * ents and need to be cleaned up on system exit.
 */

let SHIP_Z = -2;

function random_position(z=SHIP_Z){
  let distance = Math.random() * 100;
  let angle = Math.random() * 2 * Math.PI;
  
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    z: z
  }
  // return {x:-3,y:-3,z:z};
};

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

  let asteroidSprite = data.get_sprite("asteroid");

  let ents = [
    entities.asteroidFactory(random_position(0),
                             {x: -0.000008, y: -0.000008},
                             asteroidSprite, hud),
    entities.npcShipFactory(data, "shuttle",
                            random_position(), hud,
                            {state: 'passive'},
                            'direc'
                            ), 
    entities.npcShipFactory(data, "shuttle",
                            random_position(), hud,
                            {state: 'passive'},
                            'orasos'), 
    entities.npcShipFactory(data, "shuttle",
                            random_position(), hud,
                            {state: 'asteroid_hate'},
                            'orasos'), 
    entities.playerShipFactory( data, "shuttle", 
        {x: 0, y:-1, z: SHIP_Z}, camera, hud)
  ];

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
