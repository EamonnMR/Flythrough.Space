export class EntityManager {
  constructor (systems, entities) {
    if (entities) {
      this.entities = entities;
    } else {
      this.entities = {};
      this.maxId = 0;
    }
    this.delta_time = 0;
    this.systems = systems;
  }
  get (id) {
    if (id in this.entities) {
      return this.entities[id];
    } else {
      return null;
    }
  }

  insert (entity) {
    this.maxId ++;
    this.entities[this.maxId] = entity;
    entity.id = this.maxId;
    return this.maxId;
  }

  get_with ( components ){
    /*
     * This allows you to get a set of ents
     * that a system works on.
     */

    return Object.values(this.entities).filter((entity)=>{
      return components.map(
        (component) => { return component in entity }
      ).reduce(
        (accumulator, item) => { return item && accumulator;}
      )
    });
  }

  get_with_exact(member, value){
    return Object.values(this.entities).filter((entity)=>{
      return entity[member] === value;
    });
  }

  update () {

    let time = Date.now();

    if ( this.last_time ){
      this.delta_time = time - this.last_time;
    }

    this.last_time = time;
    
    if ( !this.paused) {
      for (let system of this.systems) {
        system(this);
      }
    }
  }

  clear () {
    for (let id of Object.keys(this.entities)) {
      delete_model(this.entities[id]);
    }
    let old_ents = this.entities;
    this.entities = {};
    this.maxId = 0;
    return old_ents;
  }

  pause () {
    this.paused = true;
  }

  unpause () {
    this.paused = false;
  }

};

export function deletionSystem (entMan) {
  let deleteList = [];
  for (let id in entMan.entities) {
    if (entMan.entities.hasOwnProperty(id)) {
      if ('remove' in entMan.get(id)) {
        deleteList.push(id)
      }
    }
  }
  for (let id of deleteList) {
    let entity = entMan.entities[id];
    delete_model(entity);
    delete entMan.entities[id];
  }
};

function delete_model (entity) {

  if ("weapons" in entity){
    for(let weapon of entity.weapons){
      if( "model" in weapon && weapon.model){
        weapon.model.dispose();
      }
    }
  }

  if(entity.engine_glows){
    for (let particle_system of entity.engine_glows){
      particle_system.disposeOnStop = true;
      particle_system.targetStopDuration = 5;
      particle_system.stop();
      particle_system.emitter.parent = null;
    }
  }

  const MODEL_ATTR = [
    'model',
    'radar_pip',
    'sprite',
    'overlay',
    'flash_light',
  ];

  for(let attribute of MODEL_ATTR ){
    if(attribute in entity){
      try{
        entity[attribute].dispose();
      } catch {
        console.log("attribute could not be disposed");
      }
    }
  }
}

