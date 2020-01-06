import { _ } from "./singletons.js";
import { overridable_default, utils_unit_tests } from "./util.js";
import { collision_unit_tests } from "./collision.js";

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

export class Data {
  constructor (){
    this.models = {};
    this.model_metadata = {};
    this.images = {};
    this.textures = {};
    this.sprites = {};
    this.sprite_mgrs = {};
    this.materials = {};
  }

  get_mesh(name){
    // Remember, these will come in at 0 visibility. Make sure
    // to set visibility only after you set position
    let clone = null;  // TODO: Put a cube in here
    if (name in this.models){
      let model = this.models[name];
      clone = model.mesh.clone();
      if(model.mesh.skeleton){
        clone.skeleton = model.mesh.skeleton.clone("clone");
      }
    } else { // Default for ships with no mesh
      clone = this.models["shuttle"].mesh.clone();
    }
    return clone;
  }

  get_mesh_meta(name){
    return this.models[name];
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
    //particle_system = new BABYLON.ParticleSystem("particles", 2000, _.scene);
    //proto = this.particles[type];
    //for(let prop of Object.keys(proto)){
    //  particle_system[prop] = proto[prop];
    //}
    return Object.assign(
      new BABYLON.ParticleSystem("particles", 2000, _.scene),
      this.particles[type],
    );
  }

  preprocess(){
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

function material_from_skin(skin_data){
  function path(texture_file){
    return `/assets/textures/${texture_file}`;
  }

  let mat = new BABYLON.StandardMaterial(_.scene);
  mat.diffuseTexture = new BABYLON.Texture(
    path(skin_data.diffuse),
    _.scene,
  );
  return mat
}
function load_assets( source_json, scene, data, finish_callback ){

  let manager = new BABYLON.AssetsManager(scene);
  
  for (let key in source_json.meshes) {
    let meta_blob = source_json.meshes[key];
    let model_task = manager.addMeshTask(key + '_task',
        "", "assets/",  meta_blob.file);
    data.models[key] = meta_blob;

    if(meta_blob.skins){
      for(let skin of meta_blob.skins){
        // https://stackoverflow.com/a/16107725
        (data.materials[key] || (data.materials[key] = {}))[skin] = material_from_skin(meta_blob.skins[key]);
      }
    }

    model_task.onSuccess = (task) => {
      let mesh = task.loadedMeshes[0]; // TODO: Multimesh files
      mesh.visibility = 0; // Make the clone visible when you're ready for it
      let meta_blob = data.models[key];
      meta_blob.mesh = mesh;
      meta_blob.bone_map = {};
      if(mesh.skeleton){
        for(let i = 0; i < mesh.skeleton.bones.length; i++){
          meta_blob.bone_map[mesh.skeleton.bones[i].name] = i
        }
      }
    }

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
        data_mgr.preprocess();
        if(overridable_default("test", false)){
          data_mgr.validate();
          collision_unit_tests();
          utils_unit_tests();
        }
        done(data_mgr);
      });
    }
  };

  xhr.send();
}
