import { _ } from "./singletons.js";
import {SHIP_Y, DEFAULT_LAYER} from "./graphics.js";

export function get_beam(beam_info, length){
  // TODO: Settle on a way to draw a nice beam
  if(beam_info.type === "line"){
    // TODO: This is totally broken. Why?
    let line = BABYLON.MeshBuilder.CreateLines(
      "line",
      {
        points: [
          new BABYLON.Vector3(0,SHIP_Y,0),
          new BABYLON.Vector3(0,SHIP_Y,length),
        ]
      },
      _.scene,
    );
    line.color = new BABYLON.Color3(1, 1, 1);
    return line;
  }
  if(beam_info.type === "tube"){
    console.log(length);
    let path = [
      new BABYLON.Vector3(0,SHIP_Y,0),
      new BABYLON.Vector3(length,SHIP_Y, 0),
    ]

    let beam = BABYLON.MeshBuilder.CreateTube(
      "tube",
      {
        path: path,
        radius: beam_info.radius || 1
      },
    );

    let material = new BABYLON.StandardMaterial(_.scene);
    material.alpha = 1;
    material.diffuseColor = new BABYLON.Color3(
      ...(beam_info.color || [1,1,1])
    );
    material.custom_emissive_color = beam_info.emissive_color;
    beam.material = material;
    beam.renderingGroupId = DEFAULT_LAYER;
    return beam;
  }
  

  // Alternate: I'd love to have particle-based beams too
}


