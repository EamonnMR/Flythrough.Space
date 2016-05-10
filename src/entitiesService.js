angular.module('mainApp').service('entitiesService', function(){

  function playerShipFactory(position, scene, mesh, camera, weapons, data) {
    return {
      'position': {'x': position.x, 'y': position.y},
      'weapons': weapons,
      'camera': camera,
      'model': mesh,
      'input': true,
      'direction': 0,
      'velocity': {'x': 0, 'y': 0},
      'direction_delta': 0,
      'data': data
    }
  }

  function planetFactory (position, size, sprite) {
    sprite.position.x = position.x;
    sprite.position.y = position.y;
    sprite.position.z = position.z;
    return {
      'position': {'x': position.x, 'y': position.y},
      'model': sprite
    };
  }

  function cameraFollowSystem (entMan) {
    for (let id in entMan.entities) {
      if (entMan.entities.hasOwnProperty(id)) {
        let entity = entMan.entities[id];
        if ('position' in entity && 'camera' in entity) {
          entity.camera.position.x = entity.position.x;
          entity.camera.position.y = entity.position.y;
        }
      }
    }
  };

  function modelPositionSystem (entMan) {
    for (let id in entMan.entities) {
      if (entMan.entities.hasOwnProperty(id)) {
        let entity = entMan.entities[id];
        if ('model' in entity) {
          if ('position' in entity) {
            entity.model.position.x = entity.position.x;
            entity.model.position.y = entity.position.y;
          }
          if ('direction' in entity) {
            entity.model.rotate(BABYLON.Axis.Y, entity.direction_delta, BABYLON.Space.LOCAL)
            entity.direction_delta = 0;
          }
        }
      }
    }
  };

  return {
    playerShipFactory : playerShipFactory,
    planetFactory : planetFactory,
    cameraFollowSystem : cameraFollowSystem,
    modelPositionSystem : modelPositionSystem
  }
});
