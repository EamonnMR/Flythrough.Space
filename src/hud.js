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
  constructor(scene, dom_canvas, entMan, player_data){
    // TODO: Do I actually still need to plumb the scene through here?
    // Remove it if not
    this.adt = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    this.entMan = entMan; // TODO: Should we just pass this?
    this.player_data = player_data;
    
    this.nav_text = this.get_text();
    this.nav_box = this.get_nav_box();
  }

  get_nav_box(){
    /* Mostly a nuts-and-bolts function to create
     * a HUD element in the bottom left
     */
    this.textbox = new BABYLON.GUI.Rectangle();
    this.textbox.width = 0.3;
		this.textbox.height = "120px";
		this.textbox.cornerRadius = 5;
		this.textbox.color = "Gray";
		this.textbox.thickness = 4;
		this.textbox.background = "Black";

    this.textbox.addControl(this.nav_text);

    this.adt.addControl(this.textbox);    
    this.textbox.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.textbox.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

  }

  get_text(){
    let text = new BABYLON.GUI.TextBlock();
    text.color = "White";
    text.text = "";
    return text;
  }

  update(){
    let possible_player = this.entMan.get_with(['input']);
    let player = possible_player[0];
    let planet_line = "In-System: ";
    let jump_line = "Galactic: ";
    if (this.player_data.selected_spob){
      planet_line += this.player_data.current_spob;
    }
    if (this.player_data.selected_system){
      jump_line += this.player_data.selected_system;
    }
    this.nav_text.text = [planet_line, jump_line, " "].join("\n")
  }

  dispose(){
    // Make sure we dispose everything we made and clear globals
    this.adt.dispose();
  } 
};
