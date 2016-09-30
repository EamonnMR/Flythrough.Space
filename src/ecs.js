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
    let filtered_ents = [];
    for (let id of Object.keys(this.entities)) {
       
      let ent = this.entities[id];
      let add = true;

      if (ent) {
        for ( let component of components ){
          if (! (component in ent) ){
            add = false;
            break;
          }
        }
      } else {
        add = false;
      }
      if ( add ){
        filtered_ents.push( ent );
      }
      
    }

    return filtered_ents;
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
    let old_ents = this.entities;
    this.entities = {};
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
    if ('model' in entity){
      entity.model.dispose();
    }
    delete entMan.entities[id];
  }
};

