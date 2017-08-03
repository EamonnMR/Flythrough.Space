export class Data {
  constructor (){
    this.models = {};
    this.images = {};
    this.textures = {};
    this.spobs = null;
    this.systems = null;
    this.govts = null;
  }

  get_model(name){
    // Remember, these will come in at 0 visibility. Make sure
    // to set visibility only after you set position
    return this.models[name].clone();
  }
}

function load_assets( source_json, scene, data, finish_callback ){

  let manager = new BABYLON.AssetsManager(scene);
  
  for (let key in source_json.meshes) {
    let model_task = manager.addMeshTask(key + '_task',
        "", "assets/",  source_json.meshes[key]);
    model_task.onSuccess = (task) => {
      let mesh = task.loadedMeshes[0]; // TODO: Multimesh files
      mesh.visibility = 0; // Clone this later
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

  manager.onFinish = finish_callback;

  manager.load();
}

export function load_all(engine, scene, done){
  let data_mgr = new Data();
  $.getJSON('data/assets.json', (data) => {
    load_assets(data, scene, data_mgr, () => {
      console.log(data_mgr)
      done(data_mgr);
    });
  });
}
