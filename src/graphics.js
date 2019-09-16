// This handles, among other things, the translation between "game" coordinates
// (which are top down, X, Y) into engine coordinates. The rest of the game
// can deal with 2d coordinates.
// Engine --> Game
// x      --> X
// y      --> Nothing
// Z      --> Y
import { _ } from "./singletons.js";
import { to_radians, is_cheat_enabled } from "./util.js";

const SHIP_Y = -2; // This might want to be imported from somewhere
const PLANET_SCALE = 15;  // TODO: Noticing that differently sized planet sprites end up being the same screen-space size. Weird.
const PLANET_Y = -10;  // TODO: Shots are still being drawn under planets for some reason

let CAM_OFFSET = new BABYLON.Vector3(0, 40, 30);

if (is_cheat_enabled("3dverse", false)){
  CAM_OFFSET = new BABYLON.Vector3(0, 0, 30);
}


export function get_bone_group(skeleton, prefix){
  // Get a group of bones with the same prefix
  let bone_group = [];
  for(let i = 0; i < skeleton.bones.length; i++){
    let bone = skeleton.bones[i];
    if (bone.name.startsWith(prefix)){
      bone_group.push({bone: bone, index: i});
    }
  }

  return bone_group;
};

export function get_chase_camera(){
  let camera = new BABYLON.FollowCamera("case_cam", new BABYLON.Vector3(0, 0, 0), _.scene);
  // TODO: Ingame control for these things
  camera.radius = 30;
  camera.heightOffset = 400;
  camera.rotationOffset = 0;
  camera.cameraAcceleration = .1;
  camera.maxCameraSpeed = 100;
  return camera;
};

export function uni_game_camera(){
  let camera = new BABYLON.UniversalCamera("uni_cam", CAM_OFFSET, _.scene); 
  camera.setTarget(new BABYLON.Vector3(0,0,0));
  return camera;
};

export let get_game_camera = uni_game_camera;

function mount_weapon_on_bone(weapon_model, parent_model, bone_index){
  // Translate to the bone's offset
  // Note that the Y and Z are transposed here.
  // Otherwise it comes out wrong. Something something rotation.
  let position = parent_model.skeleton.bones[bone_index].getPosition(); 
  weapon_model.translate(BABYLON.Axis.X, - position.x, BABYLON.Space.LOCAL);
  weapon_model.translate(BABYLON.Axis.Y, position.y, BABYLON.Space.LOCAL);
  weapon_model.translate(BABYLON.Axis.Z, position.z, BABYLON.Space.LOCAL);

  // Reparent to the mesh to follow
  weapon_model.parent = parent_model;
}


function mount_turreted_weapons(model_meta, ship, weapon_index){
  if("turrets" in model_meta){
    ship.turrets = []
    let turret_index = 0;

    for(let turret of model_meta.turrets){
      let associated_weapons = []
      let bone = ship.model.skeleton.bones[model_meta.bone_map[turret.bone]]
      for(let bone_name of turret.mounts){
        if(weapon_index >= ship.weapons.length){
          return;
        }

        let weapon = ship.weapons[weapon_index];
        weapon.model = _.data.get_mesh(weapon.mesh);
        mount_weapon_on_bone(weapon.model, ship.model, model_meta.bone_map[bone_name]);

        weapon.model.attachToBone(bone, ship.model);
        weapon.model.visibility = 1;
        associated_weapons.push(weapon_index);
        weapon.turret_index = turret_index;
        weapon_index ++;
      }
      let position = bone.getPosition();
      // TODO: bone.rotate(turret.facing)
      ship.turrets.push({
        "bone": bone,
        "offset": {x: position.x, y: position.z}, 
        "mounted_weapons": associated_weapons,
        "facing": to_radians( turret.facing_deg ), 
        "traverse": to_radians( turret.traverse_deg ),
        "speed": to_radians( turret.speed_deg ),
        "direction": 0,
      });
      turret_index ++;
    }
  }
} 

export function create_composite_model(ship, govt){
  // Create a ship's model out of the base mesh of the ship
  // plus the meshes of any attached upgrades.
  //
  // Hurray for justifying the creation of this entire game!
  ship.model = _.data.get_mesh(ship.mesh);

  if(govt){
    // TODO: This would be the place to add per-faction textures
    let material = new BABYLON.StandardMaterial(_.scene);
    material.alpha = 1;
    material.diffuseColor = BABYLON.Color3.FromHexString(
      // For now we just dye ships the color of their faction
      _.data.govts[govt].color.substring(0,7)
    );
    ship.model.material = material;
  }
  let model_meta = _.data.get_mesh_meta(ship.mesh);

  let weapon_index = 0;  // Note that this index is used for both loops, not reset

  // Eventually all models should have something for this, and we can 86 the test
  
  if (model_meta){

    // Fixed
    if("fixed" in model_meta && ship.model.skeleton){
      for(let bone_name of model_meta.fixed){
        if (weapon_index >= ship.weapons.length){
          break;
        }
        let weapon = ship.weapons[weapon_index] 
        weapon.model = _.data.get_mesh(weapon.mesh);
        mount_weapon_on_bone(weapon.model, ship.model, model_meta.bone_map[bone_name]);
        weapon.model.visibility = 1;
        weapon_index ++;
      }
    }

    // TODO: Turreted
    // mount_turreted_weapons(model_meta, data, ship, weapon_index)
  }
  ship.model.visibility = 1;
};

export function chaseCameraFollowSystem (entMan) {
  for (let entity of entMan.get_with(['model', 'camera'])) {
    _.camera.lockedTarget = entity.model;
    _.camera.rotationOffset = 180 * (entity.direction / Math.PI);
  }
};

export function uniCameraFollowSystem(entMan){
  for (let entity of entMan.get_with(['model', 'camera'])) {
    _.camera.position = entity.model.position.add(CAM_OFFSET);
  }
};

export let cameraFollowSystem = uniCameraFollowSystem;

export function modelPositionSystem (entMan) {
  for (let entity of entMan.get_with(['model'])) {
    if ('position' in entity) {
      // Would it be possible to get it such that
      // entity.position === entity.model.position?
      entity.model.position.x = entity.position.x;
      entity.model.position.z = entity.position.y;
    }
    if ('direction' in entity) {
      entity.model.rotate(
          BABYLON.Axis.Y, entity.direction_delta, BABYLON.Space.LOCAL);
      entity.direction_delta = 0;
    }
  }
};

export function create_planet_sprite(planet){
  // We want the planet to be a sprite because A E S T H E T I C
  // but for it to properly interact with the GUI we need an actual mesh.
  // So we create an invisible mesh and attach the sprite to it.
  // Except it does not really attach so we need to move and dispose it
  // seperately. That's why we attach the sprite to the entity.
  let sprite = null; 
  if("sprite" in planet && planet.sprite){
    sprite = _.data.get_sprite(planet.sprite);
  } else {
    // TODO: Uglier default to make it clearer that missing sprites are bugs
    sprite = _.data.get_sprite("redplanet")
  }
  sprite.size = PLANET_SCALE;  // TODO: Why aren't sizes more different?
  // ie it appears that no matter how big I make a sprite, the planet
  // appears the same size on screen. Maybe I'm just nuts.
  sprite.position.y = PLANET_Y;
  sprite.position.x = planet.x;
  sprite.position.z = planet.y;
  let sphere = BABYLON.Mesh.CreateSphere("sphere1", 2, 2, _.scene);
  sphere.translate(BABYLON.Axis.Y, PLANET_Y, BABYLON.Space.LOCAL);
  sphere.visibility = 0;
  sprite.parent = sphere;
  planet.sprite = sprite;
  return sphere;
}

export function get_engine_particle_systems(entity){
  // TODO: This could probably be part of CCM
  let particle_system = new BABYLON.ParticleSystem("particles", 2000, _.scene);

	// Source: https://www.babylonjs-playground.com/#WBQ8EM

	//Texture of each particle
	particle_system.particleTexture = new BABYLON.Texture("assets/sprites/flare.png", _.scene);

	// Where the particles come from
	particle_system.minEmitBox = new BABYLON.Vector3(0, 0, 0); // Starting all from
	particle_system.maxEmitBox = new BABYLON.Vector3(0, 0, 0); // To...


	// Colors of all particles
	particle_system.color1 = new BABYLON.Color4(1.0, 0.5, .5, 1.0);
	particle_system.color2 = new BABYLON.Color4(0.5, 0.2, .2, .5);
	particle_system.colorDead = new BABYLON.Color4(0.2, 0.2, 0.2, 0.0);

	// Size of each particle (random between...
	particle_system.minSize = 0.1;
	particle_system.maxSize = 0.5;

	// Life time of each particle (random between...

	particle_system.minLifeTime = 0.015;
	particle_system.maxLifeTime = .3;

	// Emission rate
	particle_system.emitRate = 1500;


	// Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
	particle_system.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

	// Direction of each particle after it has been emitted
	particle_system.direction1 = new BABYLON.Vector3(0, 0, 0);
	particle_system.direction2 = new BABYLON.Vector3(0, 0, 0);

	// Angular speed, in radians
	particle_system.minAngularSpeed = 0;
	particle_system.maxAngularSpeed = Math.PI;

	// Speed
	particle_system.minEmitPower = 10;
	particle_system.maxEmitPower = 12;
	particle_system.updateSpeed = 0.01;

  let emitter_node = new BABYLON.TransformNode(_.scene);
 
  particle_system.emitter = emitter_node;

  emitter_node.parent = entity.model;
  
  entity.model;
  return [particle_system];
}

export function do_explo(position){
  // TODO: This could probably be part of CCM
  let particle_system = new BABYLON.ParticleSystem("particles", 2000, _.scene);

	// Source: https://www.babylonjs-playground.com/#WBQ8EM

	//Texture of each particle
	particle_system.particleTexture = new BABYLON.Texture("assets/sprites/flare.png", _.scene);

	// Where the particles come from
	//particle_system.minEmitBox = new BABYLON.Vector3(0, 0, 0); // Starting all from
	//particle_system.maxEmitBox = new BABYLON.Vector3(0, 0, 0); // To...


	// Colors of all particles
	particle_system.color1 = new BABYLON.Color4(1.0, 0.5, .5, 1.0);
	particle_system.color2 = new BABYLON.Color4(0.6, 0.1, .1, .5);
	particle_system.colorDead = new BABYLON.Color4(0.3, 0.2, 0.2, 0.0);

	// Size of each particle (random between...
	particle_system.minSize = 0.1;
	particle_system.maxSize = 0.5;

	// Life time of each particle (random between...

	particle_system.minLifeTime = 0.04;
	particle_system.maxLifeTime = .8;

	// Emission rate
	particle_system.emitRate = 1500;


	// Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
	particle_system.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

	// Direction of each particle after it has been emitted
	//particle_system.direction1 = new BABYLON.Vector3(0, 0, 0);
	//particle_system.direction2 = new BABYLON.Vector3(0, 0, 0);
  
  particle_system.direction1 = new BABYLON.Vector3(1, 1, 1);

  particle_system.direction2 = new BABYLON.Vector3(-1, -1, -1);

	// Angular speed, in radians
	particle_system.minAngularSpeed = 0;
	particle_system.maxAngularSpeed = Math.PI;

	// Speed
	particle_system.minEmitPower = 10;
	particle_system.maxEmitPower = 12;
	particle_system.updateSpeed = 0.02;
 
  particle_system.emitter = new BABYLON.TransformNode(_.scene);
  particle_system.emitter.position.x = position.x;
  particle_system.emitter.position.y = SHIP_Y;
  particle_system.emitter.position.z = position.y;

  particle_system.preWarmCycles = 100;
  particle_system.preWarmStepOffset = 5;

  particle_system.disposeOnStop = true;
  particle_system.targetStopDuration = 50;
  particle_system.start();
  particle_system.stop();

}

export function shipAnimationSystem(entMan){
  for(let ent of entMan.get_with(['thrust_this_frame'])){
    if(ent.engine_glows){
      if(!ent.thrusting && ent.thrust_this_frame){
        for(let particle_system of Object.values(ent.engine_glows)){
          ent.thrusting = true;
          particle_system.start();
        }
      } else if (ent.thrusting && ! ent.thrust_this_frame){
        for(let particle_system of Object.values(ent.engine_glows)){
          particle_system.stop();
          ent.thrusting = false;
        }
      }
    }
  }
}
