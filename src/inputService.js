angular.module('mainApp').service('inputService', ['physicsService',
                                                   function(physicsService){


  function inputSystem (entMan) {
    for (let entity of entMan.get_with(['input'])) {
      if ('velocity' in entity) {
        if (inputStates.forward) {
          physicsService.accelerate(entity.velocity,
                                    entity.direction,
                                    entity.data.accel * entMan.delta_time)
        }
      }
      if ('direction' in entity) {
        let angle = entity.data.rotation * entMan.delta_time;

        if (inputStates.left) {
          physicsService.rotate(entity, angle);
          entity.direction_delta = -1 * angle;
        }
        else if (inputStates.right) {
          physicsService.rotate(entity, -1 * angle );
          entity.direction_delta = angle;
        }
        else {
          entity.direction_delta = 0;
        }
      }
      if ('weapons' in entity && inputStates.shoot) {
        for (let weapon of entity.weapons){
          weapon.tryShoot(entMan, entity);
        }
      }
    }
  };

  var inputStates = {
    'forward': false,
    'left': false,
    'right': false,
    'shoot': false
  };

  function handleKeyDown ( event ){
    switch(event.keyCode){
      case 38:
        inputStates.forward = true;
        break;
      case 37:
        inputStates.left = true;
        break;
      case 39:
        inputStates.right = true;
        break;
      case 17:
        inputStates.shoot = true;
        break;
    }
  };

  function handleKeyUp ( event ){
    switch(event.keyCode){
      case 38:
        inputStates.forward = false;
        break;
      case 37:
        inputStates.left = false;
        break;
      case 39:
        inputStates.right = false;
        break;
      case 17:
        inputStates.shoot = false;
        break;
      case 27: // escape
        stateChangeFunc('menu');
        break;
    }
  };

  function bindInputFunctions(){
    $(document).keydown( handleKeyDown );
    $(document).keyup( handleKeyUp );
  };

  return {
    inputSystem:        inputSystem,
    bindInputFunctions: bindInputFunctions
  }
}]);
