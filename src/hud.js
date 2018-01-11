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

    this.status_text = [
      new BABYLON.GUI.TextBlock(),
    ]
    this.status_text[0].color = "White";
    this.status_text[0].text = "Testing: 1234";
    this.get_corner_box();
  }

  get_corner_box(){
    /* Mostly a nuts-and-bolts function to create
     * a HUD element in the bottom left
     */
    this.textbox = new BABYLON.GUI.Rectangle();
    this.textbox.width = 0.1;
		this.textbox.height = "80px";
		this.textbox.cornerRadius = 5;
		this.textbox.color = "Gray";
		this.textbox.thickness = 4;
		this.textbox.background = "Black";

    for(let line of status_text){
      this.textbox.addControl(line);
    }

    this.adt.addControl(this.textbox);    
    this.textbox.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.textbox.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;

  }
  update(){
    let possible_player = this.entMan.get_with(['input']);
    let player = possible_player[0];
    if (false){
      this.status_text[0].text = "";
    }
  }

  dispose(){
    // Make sure we dispose everything we made and clear globals
    this.adt.dispose();
  } 
};
