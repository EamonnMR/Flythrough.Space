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
    // TODO: Do I actually still need to plumb the scene through here?
    // Remove it if not
    this.adt = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    this.entMan = entMan; // TODO: Should we just pass this?
    let status_lines = 2;
    let status_size = 18;

    this.status_text = [
      new BABYLON.GUI.TextBlock()
    ]
    this.status_text[0].color = "White";
    this.status_text[0].text = "Testing 123";

    this.textbox = new BABYLON.GUI.Rectangle();
    this.textbox.width = 0.1;
		this.textbox.height = "80px";
		this.textbox.cornerRadius = 5;
		this.textbox.color = "Gray";
		this.textbox.thickness = 4;
		this.textbox.background = "Black";
    this.textbox.addControl(this.status_text[0]);
    this.adt.addControl(this.textbox);    
    this.textbox.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.textbox.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;


    //for (let y = 0; x > dom_canvas.height() - ((18 + 2) * status_lines; y += 1)){
    //  let status_line = new BABYLON.GUI.TextBlock();
    //  status_line.txt =  
    //};
    /*
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
    */
  }

  update(){
    let possible_player = this.entMan.get_with(['input']);
    let player = possible_player[0];
    if (false){
      this.status_text[0].text = "";
      this.status_text[1].text = "";
    }


  }

  dispose(){
    // Make sure we dispose everything we made and clear globals
    this.adt.dispose();
  } 
};
