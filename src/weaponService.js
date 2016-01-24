angular
.module('mainApp')
.service('weaponService', [function() {
  return {
    'tryShoot': (entMan, entity) => {
      // Add a shot if applicable to the entity.
    }
  };
}])
