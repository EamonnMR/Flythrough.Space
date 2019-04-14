// This handles, among other things, the translation between "game" coordinates
// (which are top down, X, Y) into engine coordinates. The rest of the game
// can deal with 2d coordinates.
// Engine --> Game
// x      --> X
// y      --> Nothing
// Z      --> Y

const SHIP_Y = -2;
const PLANET_SCALE = 15;  // TODO: Noticing that differently sized planet sprites end up being the same screen-space size. Weird.
const PLANET_Y = -10;  // TODO: Shots are still being drawn under planets for some reason
let CAM_OFFSET = new BABYLON.Vector3(0, 40, 30);

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

export function get_chase_camera(scene){
  let camera = new BABYLON.FollowCamera("case_cam", new BABYLON.Vector3(0, 0, 0), scene);
  // TODO: Ingame control for these things
  camera.radius = 30;
  camera.heightOffset = 400;
  camera.rotationOffset = 0;
  camera.cameraAcceleration = .1;
  camera.maxCameraSpeed = 100;
  return camera;
};

export function uni_game_camera(scene){
  let camera = new BABYLON.UniversalCamera("uni_cam", CAM_OFFSET, scene); 
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


function mount_turreted_weapons(model_meta, data, ship, weapon_index){
  if("turrets" in model_meta){
    ship.turrets = []
    let turret_index = 0;

    for(let turret of model_meta.turrets){
      let associated_weapons = []
      for(let bone_name of turret.mounts){
        if(weapon_index >= ship.weapons.length){
          return;
        }

        let weapon = ship.weapons[weapon_index];
        weapon.model = data.get_mesh(weapon.mesh);
        mount_weapon_on_bone(weapon.model, ship.model, model_meta.bone_map[bone_name]);

        weapon.model.attachToBone(ship.model.skeleton.bones[model_meta.bone_map[turret.bone]], ship.model);
        weapon.model.visibility = 1;
        associated_weapons.push(weapon_index);
        weapon.turret_index = turret_index;
        weapon_index ++;
      }
      ship.turrets.push({
        "bone": ship.model.skeleton.bones[model_meta.bone_map[turret.bone]],
        "mounted_weapons": associated_weapons,
        "max_angle": null,
        "min_angle": null,
        "direction": 0,
      });
      turret_index ++;
    }
  }
} 

export function create_composite_model(ship, data){
  // Create a ship's model out of the base mesh of the ship
  // plus the meshes of any attached upgrades.
  //
  // Hurray for justifying the creation of this entire game!
  ship.model = data.get_mesh(ship.mesh);
  let model_meta = data.get_mesh_meta(ship.mesh);

  let weapon_index = 0;  // Note that this index is used for both loops, not reset

  // Eventually all models should have something for this, and we can 86 the test
  
  if (model_meta){

    // Fixed
    if("fixed" in model_meta){
      for(let bone_name of model_meta.fixed){
        if (weapon_index >= ship.weapons.length){
          break;
        }
        let weapon = ship.weapons[weapon_index] 
        weapon.model = data.get_mesh(weapon.mesh);
        mount_weapon_on_bone(weapon.model, ship.model, model_meta.bone_map[bone_name]);
        weapon.model.visibility = 1;
        weapon_index ++;
      }
    }

    // Turreted
    mount_turreted_weapons(model_meta, data, ship, weapon_index)
  }
  ship.model.visibility = 1;
};

export function chaseCameraFollowSystem (entMan) {
  for (let entity of entMan.get_with(['model', 'camera'])) {
    entity.camera.lockedTarget = entity.model;
    entity.camera.rotationOffset = 180 * (entity.direction / Math.PI);
  }
};

export function uniCameraFollowSystem(entMan){
  for (let entity of entMan.get_with(['model', 'camera'])) {
    entity.camera.position = entity.model.position.add(CAM_OFFSET);
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

/* TODO: Why is this here? vestigial code from a refactor? Is this being used? */
function count_npcs(entMan){
  // Counts the number of NPC ships in the system
  // If there's a bug with the spawner, it may be that
  // the method for counting has become inaccurate.
  // For example, right now we're just counting the number
  // of entities with an "ai" attribute.

	// To account for player fleets, etc might not be crazy to have a
  // 'native' flag that indicates that a ship was made by a spawner
  // and isn't part of a mission, etc
  return entMan.get_with(['ai']).length;
}

export function create_planet_sprite(data, planet, scene){
  // We want the planet to be a sprite because A E S T H E T I C
  // but for it to properly interact with the GUI we need an actual mesh.
  // So we create an invisible mesh and attach the sprite to it.
  // Except it does not really attach so we need to move and dispose it
  // seperately. That's why we attach the sprite to the entity.
  let sprite = null; 
  if("sprite" in planet && planet.sprite){
    sprite = data.get_sprite(planet.sprite);
  } else {
    sprite = data.get_sprite("redplanet")
  }
  sprite.size = PLANET_SCALE;
  sprite.position.y = PLANET_Y;
  sprite.position.x = planet.x;
  sprite.position.z = planet.y;
  let sphere = BABYLON.Mesh.CreateSphere("sphere1", 2, 2, scene);
  sphere.translate(BABYLON.Axis.Y, PLANET_Y, BABYLON.Space.LOCAL);
  sphere.visibility = 0;
  sprite.parent = sphere;
  planet.sprite = sprite;
  return sphere;
}
