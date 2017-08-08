/* This is sort of the last corner where the code is still being left totally
 * messy. A bunch of this needs to be broken out into loader code, and the
 * rest might be small enogh to move back to GameplaySystem
 *
 * Returns an array of models which 'belong' to the system rather than any
 * ents and need to be cleaned up on system exit.
 */

export function setup_system(scene, camera, entMan, system, hud, data){
  // Sets up the models for a system
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
    entities.asteroidFactory({x: 3, y: 3},
                             {x: -0.00008, y: -0.00008},
                             asteroidSprite)

  ]

  let planets = [];
  if ('spobs' in system_dat) {
    for (let spob_name of system_dat.spobs){
      let spob_dat = data.spobs[spob_name];
      let planetSprite = data.get_sprite("redplanet");
      let planet = entities.planetFactory(data, spob_name, hud)
      planets.push( planet );
    }
  }

  let playerWeapon = [new weapon.Weapon(500, data.sprites['redblast'])]

  entMan.insert(entities.playerShipFactory(
        data, "shuttle", {x: 0, y:-1, z: -2},
        camera, playerWeapon, hud
  ));

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
