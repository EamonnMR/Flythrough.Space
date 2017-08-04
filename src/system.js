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

  let asteroidSprite = new BABYLON.Sprite("roid", data.sprites['asteroid']);

  let ents = [
    entities.asteroidFactory({x: 3, y: 3},
                             {x: -0.00008, y: -0.00008},
                             asteroidSprite)

  ]

  let planets = [];
  if ('spobs' in system_dat) {
    for (let spob_name of system_dat.spobs){
      let spob_dat = data.spobs[spob_name];
      let planetSprite = new BABYLON.Sprite("planet", data.sprites['redplanet']);
      let planet = entities.planetFactory({
        x: spob_dat.x / 10.0,  //TODO: What scale do we use? AU?
        y: spob_dat.y / 10.0,
        z: 0}, 2, planetSprite, spob_name, hud);
      planets.push( planet );
    }
  }

  let playerData = {

    'accel': 0.00005,
    'rotation': 0.005
  }
  let playerWeapon = [new weapon.Weapon(500, data.sprites['redblast'])]

  let mesh = data.get_mesh('cruiser');
  entMan.insert(entities.playerShipFactory(
    {x: 0, y:-1, z: -2}, scene, mesh, camera, playerWeapon, playerData, hud
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
