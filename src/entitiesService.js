angular.module('mainApp').service('entitiesService', function(){

  // Making deep copies of args - good idea - right?

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

  function asteroidFactory (position, velocity, sprite) {
    sprite.position.x = position.x;
    sprite.position.y = position.y;
    sprite.position.z = 0;
    return {
      'position': {'x': position.x, 'y': position.y },
      'velocity': {'x': velocity.x, 'y': velocity.y },
      'model': sprite,
      'health': 10,
      'collider': {'radius': 5}
    }
  }

  function cameraFollowSystem (entMan) {
    for (let entity of entMan.get_with(['position', 'camera'])) {
      entity.camera.position.x = entity.position.x;
      entity.camera.position.y = entity.position.y;
    }
  };

  function modelPositionSystem (entMan) {

    for (let entity of entMan.get_with(['model'])) {
      if ('position' in entity) {
        entity.model.position.x = entity.position.x;
        entity.model.position.y = entity.position.y;
      }
      if ('direction' in entity) {
        entity.model.rotate(
            BABYLON.Axis.Y, entity.direction_delta, BABYLON.Space.LOCAL);
        entity.direction_delta = 0;
      }
    }
  };

  return {
    playerShipFactory : playerShipFactory,
    planetFactory : planetFactory,
    asteroidFactory: asteroidFactory,
    cameraFollowSystem : cameraFollowSystem,
    modelPositionSystem : modelPositionSystem
  }
});
