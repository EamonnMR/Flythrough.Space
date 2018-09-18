// This handles, among other things, the translation between "game" coordinates
// (which are top down, X, Y) into engine coordinates. The rest of the game
// can deal with 2d coordinates.
// Engine --> Game
// x      --> X
// y      --> Nothing
// Z      --> Y


const SHIP_Y = -2;
const PLANET_SCALE = 25;
const PLANET_Y = -10;
let CAM_OFFSET = new BABYLON.Vector3(0, 20, 20);

function get_bone_group(skeleton, prefix){
  // Get a group of bones with the same prefix
  let bone_group = [];
  skeleton.bones.forEach((bone) => {
    if(bone.name.startsWith(prefix)){
      bone_group.push(bone);
    }
  });

  return bone_group;
};

export function get_chase_camera(scene){
  let camera = new BABYLON.FollowCamera("case_cam", new BABYLON.Vector3(0, 0, 0), scene);
  // TODO: Ingame control for these things
  camera.radius = 30;
  camera.heightOffset = 40;
  camera.rotationOffset = 0;
  camera.cameraAcceleration = .1;
  camera.maxCameraSpeed = 100;
  return camera;
};

export function uni_game_camera(scene){
  let camera = new BABYLON.UniversalCamera("uni_cam", CAM_OFFSET, scene); 
  return camera;
};

export let get_game_camera = uni_game_camera;

export function create_composite_model(ship, data){
  // Create a ship's model out of the base mesh of the ship
  // plus the meshes of any attached upgrades.
  //
  // Hurray for justifying the creation of this entire game!
  ship.model = data.get_mesh(ship.mesh);
  let mesh_count = 0;



  if(ship.model.skeleton && ship.weapon_small){
    let bone_map = get_bone_group(ship.model.skeleton, "weapon_small_");
    if(bone_map.length > 0){
      let weapon_index = 0;
      for(let weapon of ship.weapons){
        if(weapon.mesh && weapon_index < ship.weapon_small){
          let weapon_mesh = data.get_mesh(weapon.mesh);
          weapon.model = weapon_mesh;
          // TODO: This is kinda hacky and I'm not a huge fan of it
          // There's got to be a saner way to do this (ie attachToBone)
          // but thus far they've all had holdups.
          
          // Translate to the bone's offset
          // Note that the Y and Z are transposed here.
          // Otherwise it comes out wrong. Something something rotation.
          let position = bone_map[weapon_index].getPosition(); 
          weapon.model.translate(BABYLON.Axis.X, position.x, BABYLON.Space.LOCAL);
          weapon.model.translate(BABYLON.Axis.Y, position.Y, BABYLON.Space.LOCAL);
          weapon.model.translate(BABYLON.Axis.Z, position.z, BABYLON.Space.LOCAL);

          // Reparent to the mesh to follow
          weapon.model.parent = ship.model;
          weapon.model.visibility = 1;

          weapon_index += 1;
        }
      }
    }
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
    if(! entity.cam_target){
      entity.camera.setTarget(entity.model.position);
      entity.cam_target = true;
    }
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

export function turretPointSystem (entMan) {
  for(let entity of entMan.get_with(['model'])) {
    if(entity.model.skeleton){
      for(let bone of get_bone_group(entity.model.skeleton, "turret")){
        // TODO: Rotate to face target if target exists
      }
    }
  }
};

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

export function create_planet_sprite(data, planet){
  let sprite = planet.model = data.get_sprite(data.spobtypes[planet.sType].sprite);
  sprite.size = PLANET_SCALE;
  sprite.position.y = PLANET_Y;
  return sprite;
}
