// TODO: Is it underhanded to use a module global like this?


export function selectionFollowSystem(entMan){
};

export function radarFollowSystem(entMan){
};

export class HUD{
  constructor(scene, dom_canvas, entMan){
    this.canvas = new BABYLON.ScreenSpaceCanvas2D(
        scene, {
          id: "hud",
          size: new BABYLON.Size(dom_canvas.width(), 
                                 dom_canvas.height())
        }
    );

    this.entMan = entMan; // TODO: Should we just pass this?

    this.status_text = new BABYLON.Text2D("Bla", {
      id: 'hud_status_text',
      fontName: '18pt Courier',
      parent: this.canvas
    }); 
  }

  update(){
    let possible_player = this.entMan.get_with(['input']);
    let player = possible_player[0];
    if (player){
      let position = player.position;
      let status = 'position: x: ' + position.x.toString() + ', y: ' + position.y.toString();
      this.status_text.text = status;
    }

  }

  dispose(){
    // Make sure we dispose everything we made and clear globals
    this.canvas.dispose();
  } 
};
