// TODO: Is it underhanded to use a module global like this?


export function selectionFollowSystem(entMan){
};

export function radarFollowSystem(entMan){
};

export class HUD{
  constructor(scene, dom_canvas, entMan){
    console.log(dom_canvas);
    this.canvas = new BABYLON.ScreenSpaceCanvas2D(
        scene, {
          id: "hud",
          size: new BABYLON.Size(dom_canvas.width(), 
                                 dom_canvas.height())
        }
    );
  }

  dispose(){
    // Make sure we dispose everything we made and clear globals
    this.canvas.dispose();
  } 
};
