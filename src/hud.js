// TODO: Is it underhanded to use a module global like this?

let radar_ct = 0;

export function radarFollowSystem(entMan){
  let scale_factor = 5;
  let offset = {x: 100, y:100};
  let player = entMan.get_with(['input'])[0];
  radar_ct = 0;
  if(player && player.position){
    for (let entity of entMan.get_with(['position', 'radar_pip'])){
      radar_ct += 1;
      entity.radar_pip.x = offset.x + ((entity.position.x - player.position.x) / scale_factor);
      entity.radar_pip.y = offset.y + ((entity.position.y - player.position.y) / scale_factor);
    }
  }
};

export function selectionFollowSystem(entMan){
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
    let status_lines = 2;
    let status_size = 18;
    //for (let y = 0; x > dom_canvas.height() - ((18 + 2) * status_lines; y += 1)){
    this.status_text = [
      new BABYLON.Text2D("Bla", {
        id: 'hud_status_text1',
        fontName: '18pt Courier',
        parent: this.canvas
      }),
      
      new BABYLON.Text2D("blank", {
        id: 'hud_status_text2',
        fontName: '18pt Courier',
        parent: this.canvas,
        y: 20
      })
    ];
  }

  update(){
    let possible_player = this.entMan.get_with(['input']);
    let player = possible_player[0];
    if (player){
      let position = player.position;
      this.status_text[0].text = 'position: x: ' + position.x.toString() + ', y: ' + position.y.toString();
    }

    let planet = this.entMan.get_with(['radar_pip'])[0];
    if (planet){
    this.status_text[1].text = 'Pip count: ' + radar_ct.toString();
    }


  }

  dispose(){
    // Make sure we dispose everything we made and clear globals
    this.canvas.dispose();
  } 
};
