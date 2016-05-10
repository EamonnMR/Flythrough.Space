angular
.module('mainApp')
.service('ecsService', function(){
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

  return {
    EntityManager: EntityManager,

  };
});
