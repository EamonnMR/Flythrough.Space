export function setup_system(scene, camera, entMan, system, system_dat){
  // Sets up the models for a system

  console.log(system);
  console.log(system_dat);

  let lights = [
    {
      'name': 'sun',
      'pos': {x: 0, y: 1, z: 0},
      'intensity': .5
    }
  ]

  let spriteManagerAsteroid = new BABYLON.SpriteManager(
      "roidMgr", "assets/asteroid.png", 1000, 269, scene);

  let asteroidSprite = new BABYLON.Sprite("roid", spriteManagerAsteroid);

  let ents = [
    entities.asteroidFactory({x: 3, y: 3},
                             {x: -0.00008, y: -0.00008},
                             asteroidSprite)

  ]


  let spriteManagerPlanet = new BABYLON.SpriteManager(
      "planetMgr", "assets/renderwahn_planets/A00.png", 10, 122, scene);
  let planetSprite = new BABYLON.Sprite("planet", spriteManagerPlanet);


  let planets = [
    entities.planetFactory({x:0, y:1, z: 10}, 2, planetSprite)
  ]

  BABYLON.SceneLoader.ImportMesh("", "assets/","star_cruiser_1.babylon",
      scene, function(newMesh){

    let spriteManagerBullet = new BABYLON.SpriteManager(
        "bulletMgr", "assets/redblast.png", 1000,16, scene);

    let playerData = {

      'accel': 0.00005,
      'rotation': 0.005
    }
    let playerWeapon = [new weapon.Weapon(500, spriteManagerBullet)]
    newMesh[0].rotate(BABYLON.Axis.Y, -Math.PI/2, BABYLON.Space.LOCAL)
    entMan.insert(entities.playerShipFactory(
      {x: 0, y:-1, z: -2}, scene, newMesh[0], camera, playerWeapon, playerData
    ));
  });

  return enter_system(scene, entMan, planets, lights, ents);
};


function enter_system(scene, entMan, planets, lights, ents) {
  let world_models = []

  for (let light of lights) {
    let new_light = new BABYLON.HemisphericLight(light.name,
        new BABYLON.Vector3(light.pos.x, light.pos.y, light.pos.z),
        scene
    );
    new_light.intensity = light.intensity;

    world_models.push(new_light);
  }

  for (let ent of ents) {
    entMan.insert( ent );
  }

  for (let planet of planets) {
    entMan.insert( planet );
  }

  return world_models;
};

