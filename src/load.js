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
      clone = model.clone();
      if(model.skeleton){
        clone.skeleton = model.skeleton.clone("clone");
      }
    } else { // Default for ships with no mesh
      clone = this.models["shuttle"].clone();
    }
    return clone;
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
}

function load_assets( source_json, scene, data, finish_callback ){

  let manager = new BABYLON.AssetsManager(scene);
  
  for (let key in source_json.meshes) {
    let model_task = manager.addMeshTask(key + '_task',
        "", "assets/",  source_json.meshes[key]);
    model_task.onSuccess = (task) => {
      let mesh = task.loadedMeshes[0]; // TODO: Multimesh files
      mesh.visibility = 0; // Make the clone visible when you're ready for it
      data.models[key] = mesh;
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
        done(data_mgr);
      });
    }
  };

  xhr.send();
}
