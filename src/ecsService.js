angular.module('mainApp').service('ecsService', function(){
  class EntityManager {
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

    update () {

      let time = Date.now();

      if ( this.last_time ){
        this.delta_time = time - this.last_time;
      }

      this.last_time = time;

      for (let system of this.systems) {
        system(this);
      }
    }
  };

  function deletionSystem (entMan) {
    let deleteList = [];
    for (let id in entMan.entities) {
      if (entMan.entities.hasOwnProperty(id)) {
        if ('remove' in entMan.get(id)) {
          deleteList.push(id)
        }
      }
    }
    for (let id of deleteList) {
      delete entMan.entities[id];
    }
  };

  return {
    EntityManager: EntityManager,
    deletionSystem: deletionSystem
  };
});
