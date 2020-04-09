import { angle_mod, ARC } from "./util.js"

function direction_from_vector(vector){
  return angle_mod(ARC - vector.y);
}

export function world_position_from_model(model){
  // http://www.html5gamedevs.com/topic/31288-get-absolute-rotation-of-child-mesh/ 
  let identity = BABYLON.Quaternion.Identity()
  let position = BABYLON.Vector3.Zero()
  model.getWorldMatrix().decompose(BABYLON.Vector3.Zero(), identity, position)

  return [
    {x: position.x, y: position.z},
    position.y,
    direction_from_vector(
      identity.toEulerAngles(),
    ),
  ];
}

