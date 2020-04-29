// This handles, among other things, the translation between "game" coordinates
// (which are top down, X, Y) into engine coordinates. The rest of the game
// can deal with 2d coordinates.
// Engine --> Game
// x      --> X
// y      --> Nothing
// Z      --> Y
import { _ } from "./singletons.js";
import {
  to_radians,
  is_cheat_enabled,
  overridable_default,
  polar_from_rect,
} from "./util.js";

export const SHIP_Y = 0; // This might want to be imported from somewhere
const PLANET_SCALE = 15;  // TODO: Noticing that differently sized planet sprites end up being the same screen-space size. Weird.
const PLANET_Y = 0;

const STAR_Y = 0;

const BG_LAYER = 0
const SPOB_LAYER = 1
export const DEFAULT_LAYER = 2
const MAX_LIGHTS = 3  // One is reserved for the system
// const PLAYER_LAYER = 3

let CAM_OFFSET_3DV = new BABYLON.Vector3(0, 0, 30);
let CAM_OFFSET_PERSPECTIVE = new BABYLON.Vector3(0, 42, 30);
let CAM_OFFSET_BIRDSEYE = new BABYLON.Vector3(0, 42, 0);

export function graphics_init(){
  _.scene.clearColor = new BABYLON.Color3(0, 0, 0);
  if(_.camera){
    _.camera.dispose();
  }
  _.camera = uni_game_camera();

  if(_.settings.glow_effect){
    _.glow_layer = new BABYLON.GlowLayer("glow", _.scene);
    // glow_layer.intensity = 10; // .5
    _.glow_layer.customEmissiveColorSelector = (
      mesh, subMesh, material, result
    ) => {
      result.set(...(
        material.custom_emissive_color || [0,0,0,0]
      ))
    }
  } else {
    _.glow_layer = null;
  }
}

function cam_offset(){
  let offset = CAM_OFFSET_BIRDSEYE
  if (is_cheat_enabled("3dverse", false)){
    offset = CAM_OFFSET_3DV;
  }
  if(_.settings.perspective){
    offset = CAM_OFFSET_PERSPECTIVE;
  }
  return offset.scale(_.player.zoom / 4);

}

export function camera_ready(){
  _.camera.position = cam_offset();
  _.camera.setTarget(new BABYLON.Vector3(0,0,0));
}

export function get_attachpoint_group(model_meta, prefix){
  let attachpoints = [];
  if(model_meta.attachpoint_map){
    for(let key of Object.keys(model_meta.attachpoint_map)){
      if (key.startsWith(prefix)){
        attachpoints.push(model_meta.attachpoint_map[key]);
      }
    }
  }

  return attachpoints;
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

function uni_game_camera(){
  let camera = new BABYLON.UniversalCamera("uni_cam", new BABYLON.Vector3(0,0,0), _.scene); 
  return camera;
};

function mount_on_attachpoint(child_model, parent_model, attachpoint){
  if(! attachpoint){
    return;
  }

  let position = attachpoint.position;
  child_model.translate(BABYLON.Axis.X, position.x, BABYLON.Space.LOCAL);
  child_model.translate(BABYLON.Axis.Y, position.y, BABYLON.Space.LOCAL);
  child_model.translate(BABYLON.Axis.Z, position.z, BABYLON.Space.LOCAL);

  // Follow the parent's position
  child_model.parent = parent_model;
}


function mount_turreted_weapons(model_meta, ship, weapon_index){
  ship.turrets = []
  let attachpoints = get_attachpoint_group(model_meta, "turret");
  let turret_index = 0;

  for(let attachpoint of attachpoints){
    if(weapon_index >= ship.weapons.length){
      return;
    }
    // TODO: Per-ship turrets
    let turret_model = _.data.get_mesh("_turret")
    let turret_material = _.data.get_material("_turret");  // TODO: Faction code this
    if(turret_material){
      turret_model.material = turret_material;
    }
    let turret_meta = _.data.get_mesh_meta("_turret");

    let weapon = ship.weapons[weapon_index];
    weapon.model = _.data.get_mesh(weapon.mesh);
    let weapon_material = _.data.get_material(weapon.mesh, weapon.skin);
    if(weapon_material){
      weapon.model.material = weapon_material;
    }
    mount_on_attachpoint(weapon.model, turret_model, get_attachpoint_group(turret_meta, "weapon")[0])
    mount_on_attachpoint(turret_model, ship.model, attachpoint);

    for(let model of [weapon.model, turret_model]){
      model.visibility = 1;
      model.renderingGroupId = DEFAULT_LAYER;
    }
    weapon.turret_index = turret_index;
    // TODO: bone.rotate(turret.facing)
    ship.turrets.push({
      "model": turret_model,
      "offset": polar_from_rect({
        x: attachpoint.position.x,
        y: attachpoint.position.z,
      }), 
      // TODO: Multi-weapon turrets
      "mounted_weapons": [weapon],
      /*
      "facing": to_radians( turret.facing_deg ), 
      "traverse": to_radians( turret.traverse_deg ),
      "speed": to_radians( turret.speed_deg ),
      */
      "direction": 0,
    });
    weapon_index ++;
    turret_index ++;
  }
  return weapon_index;
} 

export function set_dark_texture(entity){
  // Version of the ship's texture with the lights off
  // Could also be used to show battle damage, etc
  let material = _.data.get_material(
    entity.mesh,
    `${entity.skin}/dark`,
  );
  if(material){
    entity.model.material = material;
  }
  if("weapons" in entity){
    entity.weapons.forEach((weapon) => {
      if(weapon.model){
        let material = _.data.get_material(weapon.mesh, weapon.skin ? weapon.skin + "/dark" : "dark");
      }
    });
  }
  if("turrets" in entity){
    entity.turrets.forEach((turret) => {
      // TODO: Will turrets need dark textures ever?
      turret.mounted_weapons.forEach(( weapon ) => {
        if(weapon.model){
          let material = _.data.get_material(weapon.mesh, weapon.skin ? weapon.skin + "/dark" : "dark");
        }
      });
    });
  }
}

export function create_asteroid_model(asteroid){
  asteroid.model = _.data.get_mesh(asteroid.mesh);
  let material = _.data.get_material(asteroid.mesh, asteroid.skin);
  asteroid.model.material = material;
  add_model(asteroid.model);
  asteroid.model.visibility = 1;
  asteroid.model.renderingGroupId = DEFAULT_LAYER;
}

export function create_composite_model(ship, govt){
  // Create a ship's model out of the base mesh of the ship
  // plus the meshes of any attached upgrades.
  //
  // Hurray for justifying the creation of this entire game!
  ship.model = _.data.get_mesh(ship.mesh);

  let model_meta = _.data.get_mesh_meta(ship.mesh);
  if(govt){
    let material = _.data.get_material(ship.mesh, govt);
    if(material){
      ship.skin = govt;
    } else {
      // Ships without textures just get a dye
      material = new BABYLON.StandardMaterial(_.scene);
      material.alpha = 1;
      material.diffuseColor = BABYLON.Color3.FromHexString(
         _.data.govts[govt].color.substring(0,7)
      );
    }
    ship.model.material = material;
  } else {
    // TODO: Let player choose skin - cool!
    let skin = overridable_default("skin", null) || _.player.ship_skin || model_meta.default_skin;
    let material = _.data.get_material(ship.mesh, skin);
    if(material){
      ship.skin = skin;
      ship.model.material = material;
    }
  }

  add_model(ship.model);

  // Eventually all models should have something for this, and we can 86 the test
  
  // Use turrets preferentially 
  let weapon_index = mount_turreted_weapons(model_meta, ship, 0);
  mount_fixed_weapons_on_ship(model_meta, ship, weapon_index);

  ship.model.renderingGroupId = DEFAULT_LAYER;
  ship.model.visibility = 1;
};

function mount_fixed_weapons_on_ship(model_meta, ship, weapon_index){
  /* Returns total number of weapons placed (so you know where
   * to start in the weapons list for picking turreted weapons
   */
  let attachpoints = get_attachpoint_group(model_meta, "weapon");
  let min = Math.min(attachpoints.length, ship.weapons.length - weapon_index);
  for(let i = weapon_index; i < min + weapon_index; i++){
    let weapon = ship.weapons[i] 
    weapon.model = _.data.get_mesh(weapon.mesh);
    let material = _.data.get_material(weapon.mesh, weapon.skin);
    if(material){
      weapon.model.material = material;
    }
    weapon.model.renderingGroupId = DEFAULT_LAYER;
    mount_on_attachpoint(weapon.model, ship.model, attachpoints[i - weapon_index]);
    add_model(weapon.model);
    weapon.model.visibility = 1;
  }
  return min;
}

export function chaseCameraFollowSystem (entMan) {
  for (let entity of entMan.get_with(['model', 'camera'])) {
    _.camera.lockedTarget = entity.model;
    _.camera.rotationOffset = 180 * (entity.direction / Math.PI);
  }
};

export function uniCameraFollowSystem(entMan){
  for (let entity of entMan.get_with(['model', 'camera'])) {
    _.camera.position = entity.model.position.add(cam_offset());
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
    if ('direction_delta' in entity) {
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
  // TODO: Is any of this still true?
  let sprite = null; 
  if("sprite" in planet && planet.sprite){
    sprite = get_sprite(planet.sprite, SPOB_LAYER);
  } else {
    // TODO: Uglier default to make it clearer that missing sprites are bugs
    // Maybe make it look like the amiga ball?
    sprite = get_sprite("redplanet", SPOB_LAYER)
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


  let particle_systems = []
  for_each_engine(entity, (attachpoint) => {
    // TODO: This could probably be part of CCM
    let particle_system = _.data.get_particle_system(entity.engine_particle_sys_name);
    let emitter_node = new BABYLON.TransformNode(_.scene);
    particle_system.emitter = emitter_node;
    particle_system.renderingGroupId = DEFAULT_LAYER;
    mount_on_attachpoint(emitter_node, entity.model, attachpoint);
    particle_systems.push(particle_system); 
  })
  return particle_systems;
}


function for_each_engine(entity, callback){
  for_each_special_attachpoint(entity, "engine", callback);
}


function for_each_special_attachpoint(entity, attachpoint_type, callback){
  // TODO: Remove the requirement of specifying this in the meta
  let model_meta = _.data.get_mesh_meta(entity.mesh);
  if(model_meta && model_meta.attachpoint_map){
    for(let attachpoint of get_attachpoint_group(
      model_meta, attachpoint_type)
    ){
      callback(attachpoint);
    }
  }
}

export function do_explo(position, type="explosion", scale=1){
  // TODO: This could probably be part of CCM
  let particle_system = _.data.get_particle_system(type);
  /*
  if("mass_scale" in particle_system){
    particle_system.mass_scale.forEach((key) => {
      particle_system[key] = scale * particle_system[scale];
    });
  }
  */
  particle_system.emitter = new BABYLON.TransformNode(_.scene);
  particle_system.emitter.position.x = position.x;
  particle_system.emitter.position.y = SHIP_Y;
  particle_system.emitter.position.z = position.y;
  particle_system.disposeOnStop = true;
  particle_system.renderingGroupId = DEFAULT_LAYER;
  particle_system.start();
  particle_system.stop();
}

export function shipAnimationSystem(entMan){
  for(let ent of entMan.get_with(['thrust_this_frame'])){
    if(ent.engine_trails){
      if(!ent.thrusting && ent.thrust_this_frame){
        for(let particle_system of Object.values(ent.engine_trails)){
          ent.thrusting = true;
          particle_system.start();
        }
      } else if (ent.thrusting && ! ent.thrust_this_frame){
        for(let particle_system of Object.values(ent.engine_trails)){
          particle_system.stop();
          ent.thrusting = false;
        }
      }
    }
  }
}

export function flashSystem(entMan){
  for(let ent of entMan.get_with(['flash_light', 'attack', 'age', 'peak', "max_age"])){
    if(ent.age < ent.attack){
      ent.flash_light.intensity = ent.peak * (ent.age / ent.attack)
    } else {
      ent.flash_light.intensity = ent.peak * 1 - ((ent.age - ent.attack) / (ent.max_age - ent.attack)); 
    }
  }
}

export function make_way_for_light(intensity){
  /* We can only have a limited number of lights.
   * This function checks to see if the lowest intensity
   * light is lower than the new intensity and if so,
   * removes it.
   */
  
  return true;

  let lights = _.entities.get_with(["flash_light"]).sort((a, b) => {
    return b.peak - a.peak;
  })
  if(lights.length >= MAX_LIGHTS){
    if(lights[0].peak < intensity){
      lights[0].flash_light.dispose();
      lights[0].remove = true;
      return true
    } else {
      return false
    }
  } else {
    return true;
  }
}

export function flash_factory(position, peak_intensity, attack, decay){
  // Should be a point light?
  let light = new BABYLON.PointLight(
    "flash",
    new BABYLON.Vector3(position.x, SHIP_Y, position.y),
    _.scene,
  );
  // TODO: Parameterize this
  light.specular = new BABYLON.Color3(1,1,1);
  light.diffuse = new BABYLON.Color3(1,1,1);
  add_light(light);
  return {
    "flash_light": light,
    "attack": attack,
    "max_age": attack + decay,
    "peak": peak_intensity,
    "age": 0,
  }
}

export function add_light(light){
  if(_.settings.shadows){
    let shadow = new BABYLON.ShadowGenerator(1024, light);
    shadow.bias = 0.05;
    _.entities.get_with(["model"]).forEach((ent) => {
      // This is used to screen out anything that's actually
      // a sprite (which crashes the game)
      //
      // See add_model
      if( ent.model.receiveShadows ){
        console.log("Added to shadowcaster: ");
        console.log(ent.model);
        shadow.getShadowMap().renderList.push(ent.model);
      }
    })
    _.shadows.push(shadow);
    // TODO: For later disposal;
    light.shadow_caster = shadow;
  }
}

export function add_model(model){
  if( _.settings.shadows ){
    model.receiveShadows = true;
    _.shadows.forEach((shadow) => {
      let map = shadow.getShadowMap();
      if(map){
        map.renderList.push(model);
      }
    });
  }
}

export function create_starfield(){
  const STAR_COUNT = 10000;
  const MAX_SIZE = 1000;
  let max_depth = _.settings.parallax_starfield ? -100 : 0;
  let stars = []
  console.log(_.data);
  let sprite_mgr = _.data.new_sprite_manager("star", BG_LAYER);
  function random_axis(){
    return Math.round((Math.random() - .5) * MAX_SIZE * 2);
  }
  for(let i = 0; i < STAR_COUNT; i++){
    let star = new BABYLON.Sprite("star", sprite_mgr)
    star.position.x = random_axis()
    star.position.y = Math.round(Math.random() * max_depth) + STAR_Y;
    star.position.z = random_axis() 
    stars.push(star);
  }
  return [sprite_mgr, stars];
}

export function get_sprite_manager(sprite, layer=DEFAULT_LAYER){
  /* TODO: This isn't good.
   * What this is doing is getting the global, shared sprite
   * manager for a given sprite and setting its rendering group
   * ID. As long as no sprites are used across rendering groups
   * this is fine. */
  let sprite_mgr = _.data.get_sprite_mgr(sprite, layer);
  return sprite_mgr;
}

export function get_sprite(sprite, layer=DEFAULT_LAYER){
  return new BABYLON.Sprite(sprite, _.data.get_sprite_mgr(sprite, layer));
}

export function material_from_skin(skin_data, dark){
  function path(texture_file){
    return `/assets/textures/${texture_file}`;
  }

  let mat = new BABYLON.StandardMaterial(_.scene);
  if(skin_data.diffuse){
    mat.diffuseTexture = new BABYLON.Texture(
      path(skin_data.diffuse),
      _.scene,
    );
  }
  if(skin_data.emissive){
    mat.emissiveTexture = new BABYLON.Texture(
      path(skin_data.emissive),
      _.scene,
    );
  }

  if(skin_data.custom_emissive_color){
    // Used by the customEmissiveColorSelector
    mat.custom_emissive_color = skin_data.custom_emissive_color;
  }
  return mat
}


