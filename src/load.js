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

  function text_loaded( task, key ){
    console.log(key);
    console.log(task);
  }

  function asset_error( task, key ){
    console.log('Error: ');
    console.log(task);
    console.log(key);
  }

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
  

  //for (let key in source_json.data){
  //  let data_task = manager.addTextTask(key + '_task',
  //    "", "data/", source_json.data[key]);
  //  data_task.onSuccess = (task) => {
  //    data_loaded(task, key);
  //  }
  //}

  manager.onFinish = () => {
    finish_callback();
  }

  manager.load();
}

export function load_all(engine, scene, done){
  let data_mgr = new Data();
  $.getJSON('data/assets.json', (data) => {
    load_assets(data, scene, data_mgr, () => {
      // TODO: Replace this with AssetManager text loads
      $.when(
        $.getJSON('data/systems.json', ( data ) =>  {
          data_mgr.systems = data.systems;
          data_mgr.govts = data.govts;
          console.log(data);
        }),
        $.getJSON('data/spobs.json', ( data ) => {
          data_mgr.spobs = data;
          console.log(data);
        })
      ).then( () => {
        done(data_mgr);
      });
    });
  });
}
