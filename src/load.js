import { _ } from "./singletons.js";
import { overridable_default, utils_unit_tests, update_settings } from "./util.js";
import { collision_unit_tests } from "./collision.js";
import { fighters_unit_tests } from "./fighters.js";
import { 
  test_every_item_available_somewhere,
  test_every_spob_with_tech_sells_things
} from "./tech.js";
import { material_from_skin } from "./graphics.js";
import { multiInherit, CARRIED_PREFIX } from "./util.js";
import { player_unit_tests } from "./player.js";

/* The root of everything here is 'assets.json'.
 * It lists asset files/data for special assets - 
 * the ones created explicitly in the Data constructor.
 * For 'data' assets, you've got the 'data' block in
 * assets.json. You link a json file there and it's stuck
 * directly into the data object under the key in "data".
 */

// TODO: Play around with these and find the actual maxes and mins.
const SHIP_CONSTRAINTS = {
  rotation: {max: 0.003, min: 0.001},
  accel: {max: 0.001, min: 0.00001},
  max_speed: {max: 0.04, min: 0.0001},
}

const PROTOTYPES = {
  spobs: {
    x: 0,
    y: 0
  },
  asteroids: {
    explosion: "asteroid_breakup",
  },
  ships: {
    explosion: "explosion",
    upgrades: {},
    turret_rot_speed: Math.PI / 50,
    max_boarding_velocity_diff: 10,
    max_boarding_distance: 25,
    max_landing_distance: 50,
    min_hyperjump_distance: 100,
    cargo_carried: {},
    money: 0,
    engine_particle_sys_name: "conventional_engine",
    can_pickup: true,
  },
  systems: {
    lights: [
      {
        // type: "hemi",
        position: [0,1,0],
        intensity: .3,
        type: "point",
      }
    ],
    roids: {
      set: "basic",
      count: 25,
      radius: 600,
      velocity: 0.01
    },
  },
  particles: {
    particleTexture: "flare.png",
    blendMode: "BLENDMODE_ONEONE",
    direction1: [1,1,1],
    direction2: [-1,-1,-1],
    minAngularSpeed: 0,
    maxAngularSpeed: 3.14159,
  },
}

const CLONE_ATTRS = [
  "particleTexture",
];

export class Data {
  constructor (){
    this.models = {};
    this.model_metadata = {};
    this.images = {};
    this.textures = {};
    this.sprites = {};
    this.sprite_mgrs = {};
    this.materials = {};
    this.sounds = {};
  }

  get_sound(name, parent_mesh){
    let sound= new BABYLON.Sound(name, this.sounds[name], _.scene, null, {
      loop: false,
      autoplay: false,
      spatialSound: true,
      distanceModel: "exponential",
      rolloffFactor: 0.1,
    });
    sound.attachToMesh(parent_mesh);

    return sound;
  }

  play_sound_at_position(name, position){
    let sound= new BABYLON.Sound(name, this.sounds[name], _.scene, null, {
      loop: false,
      autoplay: true,
      spatialSound: true,
      distanceModel: "exponential",
      rolloffFactor: 0.1,
    })
    sound.setPosition(position);
    sound.play();
  }


  get_mesh(name){
    // Remember, these will come in at 0 visibility. Make sure
    // to set visibility only after you set position
    let clone = null;  // TODO: Put a cube in here
    if (name in this.models){
      let model = this.models[name];
      clone = model.mesh.clone();
      // TODO: Remove all references to skeleton
      // if(model.mesh.skeleton){
      //   clone.skeleton = model.mesh.skeleton.clone("clone");
      // }
    } else { // Default for ships with no mesh
      clone = this.models["shuttle"].mesh.clone();
    }
    return clone;
  }

  get_mesh_meta(name){
    return this.models[name];
  }

  get_material(mesh, name){
    if(!name){
      name = this.get_mesh_meta(mesh).default_skin;
    }
    if(name === "dark"){
      name = this.get_mesh_meta(mesh).default_skin_dark;
    }
    if (!(mesh in this.materials)){
      return undefined;
    }
    if (!(name in this.materials[mesh])){
      return undefined;
    }
    return this.materials[mesh][name];
  }

  get_sprite_mgr(name, layer=null){
    /* REMINDER: This returns a single object for a given name
     *
     * Does NOT create a new sprite manager.
     * DO NOT DISPOSE OF IT!
     *
     * (if you need a fresh sprite MGR, use new_sprite_manager)
     */
    // TODO: Better default
    let sprname = "redplanet";
    if (name in this.sprite_mgrs){
      sprname = name;
    }
    if(layer){
      /* SIDE EFFECTS!!! */
      this.sprite_mgrs[sprname].renderingGroupId = layer;
    }

    return this.sprite_mgrs[sprname];
  }
  
  new_sprite_manager(name, layer=null){
    let datum = this.sprites[name]
    let mgr = new BABYLON.SpriteManager(
      name + "_sprmgr",
      datum.img,
      datum.count,
      datum.size,
      _.scene
    );
    if(layer){
      mgr.renderingGroupId = layer;
    }
    return mgr;
  }


  get_particle_system(type){
    let part_sys = new BABYLON.ParticleSystem("particles" + Math.random(), 2000, _.scene);
    Object.assign(part_sys, this.particles[type]);
    for(let attr of CLONE_ATTRS){
      // If we just assign the same texture, they get
      // disposed, so we need to clone it.
      part_sys[attr] = part_sys[attr].clone();
    }
    return part_sys;
  }

  preprocess_particle_systems(){
    // Preprocess Particle systems
    // Deserialize BABYLON classes from json
    const COLOR_4_ATTRS = [
      "color1",
      "color2",
      "colorDead"
    ];
    const VECTOR_3_ATTRS = [
      "minEmitBox",
      "maxEmitBox",
      "direction1",
      "direction2",
    ];
    const CONST_ATTRS = [
      "blendMode"
    ];
    const TEXTURE_ATTRS = [
      "particleTexture"
    ];
    for(let particle_system of Object.values(this.particles)){
      for(let attr of COLOR_4_ATTRS){
        if (attr in particle_system){
          particle_system[attr] = new BABYLON.Color4(...particle_system[attr]);
        }
      }
      for(let attr of VECTOR_3_ATTRS){
        if (attr in particle_system){
          particle_system[attr] = new BABYLON.Vector3(...particle_system[attr]);
        }
      }
      for(let attr of CONST_ATTRS){
        if (attr in particle_system){
          particle_system[attr] = BABYLON.ParticleSystem[particle_system[attr]];
        }
      }
      for(let attr of TEXTURE_ATTRS){
        if (attr in particle_system){
          particle_system[attr] = new BABYLON.Texture(
            "assets/sprites/" + particle_system[attr]
          );
        }
      }
    }
  }

  resolve_proto_chain(name, type){
    if(name){ 
      let parent = this[type][name];
      if(parent === undefined){
        console.log(`*** Parent not found: ${type}/${name}`);
      } else {
        let obj = Object.assign(
          Object.assign(
            {},  // Essentially a clone op
            this.resolve_proto_chain(parent.extends, type),
          ),
          parent
        );
        return obj;
      }
    }
    return PROTOTYPES[type] 
  } 

  resolve_proto_chains(){
    // This implements the 'extends' feature, and allows
    // default values to be set for game objects.
    for(let type of Object.keys(PROTOTYPES)){
      for(let item of Object.keys(this[type])){
        this[type][item] = this.resolve_proto_chain(item, type)
      }
    }
  }

  set_type_keys(){
    // In case you need to ask an entity what its type is
    const TYPES = ["ships", "asteroids", "upgrades"];
    for(let type of TYPES){
      for(let item of Object.keys(this[type])){
        this[type][item].type = item;
      }
    }
  }

  create_upgrades_for_carried_fighters(){
    // We want to be able to track carried fighters as upgrades
    for(let ship_id of Object.keys(this.ships)){
      let ship = this.ships[ship_id]
      if("as_carried" in ship){
        this.upgrades[CARRIED_PREFIX + ship_id] = Object.assign(
          {
            name: ship.long_name,
            tech: ship.tech,
            price: ship.price * 0.75,
            desc: ship.desc,
          },
          ship.as_carried
        );
      }
    }
  }

  validate(){
    // Generally game logic should not live in the loader, but having
    // the data consistency checked at load time is a major QOL thing.
    // Additionally, this could be spun out into a unit test at some
    // point.

    // Validate that ships in NPC grops refer to real ships
    if("npc_groups" in this && "ships" in this){
      Object.keys(this.npc_groups).forEach( (name, index) => {
        for(let ship of this.npc_groups[name].ships){
          if(!(ship in this.ships)){
            console.log("**Data Validation** Ship  \"" + ship + "\" in group \"" + name + "\" not found");
          }
        }
      });
    }

    if("spobs" in this && "systems" in this){
      Object.keys(this.systems).forEach( (name, index) => {
        if("spobs" in this.systems[name] && this.systems[name].spobs){
          for(let spob_name of this.systems[name].spobs){
            if(typeof(this.systems[name].spobs) !== typeof([])){
              console.log(`**Data Validation** Spob list for ${name} is not a list: ${this.systems[name].spobs}`);
            } else if(spob_name in this.spobs ){
              
            } else {

              console.log(`**Data Validation** Nonexistant spob ${spob_name} in the ${name} system`);
            }
          }
        }
      });
    } else {
      console.log("** Data Validation ** Missing spobs or systems.");
    }

    if("ships" in this){
      Object.keys(this.ships).forEach((ship_name) => {
        Object.keys(SHIP_CONSTRAINTS).forEach( (attr) => {
          let ship = this.ships[ship_name];
          let constr = SHIP_CONSTRAINTS[attr];
          if( ship[attr] > constr.max ){
            console.log(`**Gameplay Warning** ${ship_name}.${attr} is ${ship[attr]} which is larger than the max, ${constr.max}`);
          }
          if( ship[attr] < constr.min ){
            console.log(`**Gameplay Warning** ${ship_name}.${attr} is ${ship[attr]} which is smaller than the min, ${constr.min}`);
          }
       });
      });
    } else {
      console.log("** Data Validation ** Ships data missing.");
    }
  } 
}

function load_assets( source_json, scene, data, finish_callback ){

  let manager = new BABYLON.AssetsManager(scene);
  
  for (let key in source_json.meshes) {
    let meta_blob = source_json.meshes[key];
    let model_task = manager.addMeshTask(key + '_task',
        "", "assets/",  meta_blob.file);
    data.models[key] = meta_blob;

    if(meta_blob.skins){
      let skins = {}
      for(let skin of Object.keys(meta_blob.skins)){
        // https://stackoverflow.com/a/16107725
        skins[skin] = material_from_skin(meta_blob.skins[skin]);
      }
      data.materials[key] = skins;
    }

    model_task.onSuccess = (task) => {
      let meta_blob = data.models[key]; // This gets mutated!
      meta_blob.mesh = get_main_mesh_from_model_load_task(task);

      meta_blob.attachpoint_map = get_attach_points_from_model_load_task(task);
      hide_all_meshes_for_task(task);
      // Scaling does not work, why?
      if("scale" in meta_blob){
        let mesh = meta_blob.mesh;
        mesh.scaling.x = meta_blob.scale;
        mesh.scaling.y = meta_blob.scale;
        mesh.scaling.z = meta_blob.scale;
        // Otherwise it'll get drawn in a weird place
        mesh.bakeCurrentTransformIntoVertices(
          mesh.getWorldMatrix()
        );
      }
    }

    // TODO: Do we need to get the offsets from ._children
    // or can we simply parent stuff to the appropriate child
    // somewhere down the line. Lots of experiments are needed.

    model_task.onError = (task) => {
      // TODO: Why is this getting called on successes too?
      // asset_error(task, key);
    }

  }
  

  for (let key in source_json.data){
    let data_task = manager.addTextFileTask(key + '_task',
      "data/" +  source_json.data[key]);
    data_task.onSuccess = (task) => {
      data[key] = JSON.parse(task.text);
    }
    data_task.onError = (task, message, exception) => {
      console.log("Can't load " + key + " Data error: " + message);
      console.log(exception);
    }
  }
  data.sprites = source_json.sprites;
  for (let key in source_json.sprites){
    // TODO: Fix Copypasta
    let datum = source_json.sprites[key]
    data.sprite_mgrs[key] = new BABYLON.SpriteManager(
      key + "_sprmgr",
      datum.img,
      datum.count,
      datum.size,
      scene
    );
  }

  data.sounds = source_json.sounds;
  
  manager.onFinish = finish_callback;
  manager.load();
}

export function load_all(engine, scene, done){
  let data_mgr = new Data();
  // If I was going to need this more than once, I'd make a "get json" function.
  let xhr = new XMLHttpRequest();
  xhr.open('GET', 'data/assets.json', true);
  xhr.onload = () => {
    if (xhr.status == 200){
      load_assets(JSON.parse(xhr.responseText), scene, data_mgr, () => {
        data_mgr.set_type_keys();  // TODO: Redundant?
        data_mgr.resolve_proto_chains();
        data_mgr.preprocess_particle_systems();
        data_mgr.create_upgrades_for_carried_fighters();
        update_settings(); 
        _.data = data_mgr;
        if(_.settings.run_tests){
          data_mgr.validate();
          test_every_item_available_somewhere(data_mgr);
          test_every_spob_with_tech_sells_things(data_mgr);
          collision_unit_tests();
          utils_unit_tests();
          fighters_unit_tests();
          player_unit_tests();
        }
        done();
      });
    }
  };

  xhr.send();
}

function get_main_mesh_from_model_load_task(task){
  for(let possible_main_mesh of task.loadedMeshes){
    if(possible_main_mesh.name == "main"){
      return possible_main_mesh;
    }
  }
  return task.loadedMeshes[0]; // Default: just look at 0
}

function get_attach_points_from_model_load_task(task){
  let map = {};
  task.loadedMeshes.forEach((child) => {
    map[child.name] = child;
  })
  return map;
}

function hide_all_meshes_for_task(task){
  task.loadedMeshes.forEach((mesh) => {
    mesh.visibility = 0;
  });
}

