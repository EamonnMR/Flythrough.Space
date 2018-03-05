export function radarFollowSystem(entMan){
  let scale_factor = 5;
  let offset = {x: 100, y:100};
  let player = entMan.get_with(['input'])[0];
  if(player && player.position){
    for (let entity of entMan.get_with(['position', 'radar_pip'])){
      // Position, relative to the player, inverted
      entity.radar_pip.left = (entity.position.x - player.position.x) / scale_factor;
      entity.radar_pip.top = (entity.position.y - player.position.y) / (-1 * scale_factor);
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
    this.radar_box = this.get_radar_box();
    this.nav_box = this.get_nav_box();
  }


  get_radar_pip(size, color){
    /* Defines the style for Radar Pips */
    let pip = new BABYLON.GUI.Ellipse();
    let str_size = size + "px";
    pip.height = str_size;
    pip.width = str_size;
    pip.background = "Black";
    pip.color = color;
    pip.thickness = 2;
    pip.zIndex = 1
    this.radar_box.addControl(pip);
    return pip;
  }


  get_nav_box(){
    let box = this.get_box_generic("200px", "80px");

    box.addControl(this.nav_text);
    this.nav_text.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT

    this.adt.addControl(box);    
    box.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    box.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    return box

  }

  get_radar_box(){
    let box = this.get_box_generic("200px", "200px");

    this.adt.addControl(box);
    box.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    box.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    return box;
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
    let fuel_line = "Fuel (jumps): " + this.player_data.fuel;
    if (this.player_data.selected_spob){
      planet_line += this.player_data.selected_spob;
    }
    if (this.player_data.selected_system){
      jump_line += this.player_data.selected_system;
    }
    this.nav_text.text = [planet_line, jump_line, fuel_line, ""].join("\n")
  }

  dispose(){
    // Make sure we dispose everything we made and clear globals
    this.adt.dispose();
  } 

  get_box_generic(width, height){
    /* Defines the style for HUD boxes */
    let box = new BABYLON.GUI.Rectangle();
    box.height = height;
    box.width = width;
    box.alpha = .5;
    box.background = "Black";
    box.color = "Gray";
    // box.corner_radius = 5;

    return box;
  }
};
