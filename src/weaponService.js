angular
.module('mainApp')
.service('physicsService', ['physicsService', function() {
  return {
    'tryShoot': (entMan, entity) => {
      // Add a shot if applicable to the entity.
    }
  };
}])
