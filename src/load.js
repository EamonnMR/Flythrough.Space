/* The root of everything here is 'assets.json'.
 * It lists asset files/data for special assets - 
 * the ones created explicitly in the Data constructor.
 * For 'data' assets, you've got the 'data' block in
 * assets.json. You link a json file there and it's stuck
 * directly into the data object under the key in "data".
 */


export class Data {
  constructor (){
    this.models = {};
    this.model_metadata = {};
    this.images = {};
    this.textures = {};
    this.spobs = null;
    this.systems = null;
    this.govts = null;
    this.sprites = {}
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

  get_sprite_mgr(name){
    // TODO: Better default
    let sprname = "redplanet";
    if (name in this.sprites){
      sprname = name;
    }
    return this.sprites[sprname];
  }
  
  get_sprite(name){
    return new BABYLON.Sprite(name, this.get_sprite_mgr(name));
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
      
}


}

function load_assets( source_json, scene, data, finish_callback ){

  let manager = new BABYLON.AssetsManager(scene);
  
  for (let key in source_json.meshes) {
    let meta_blob = source_json.meshes[key];
    let model_task = manager.addMeshTask(key + '_task',
        "", "assets/",  meta_blob.file);
    data.models[key] = meta_blob;
    model_task.onSuccess = (task) => {
      let mesh = task.loadedMeshes[0]; // TODO: Multimesh files
      mesh.visibility = 0; // Make the clone visible when you're ready for it
      let meta_blob = data.models[key];
      meta_blob.mesh = mesh;
      if(mesh.skeleton){
        meta_blob.bone_map = {};
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
  }

  for (let key in source_json.sprites){
    let datum = source_json.sprites[key]
    data.sprites[key] = new BABYLON.SpriteManager(key + "_sprmgr",
        datum.img, datum.count, datum.size, scene);
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
        data_mgr.validate();
        done(data_mgr);
      });
    }
  };

  xhr.send();
}
