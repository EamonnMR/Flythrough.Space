import { get_text } from "./util.js"

export function radarFollowSystem(entMan){
  let scale_factor = 5;
  let offset = {x: 100, y:100};
  let player = entMan.get_with(['input'])[0];
  if(player && player.position){
    for (let entity of entMan.get_with(['position', 'radar_pip'])){
      // Position, relative to the player, inverted
      entity.radar_pip.left = (entity.position.x - player.position.x) / (-1 * scale_factor);
      entity.radar_pip.top = (entity.position.y - player.position.y) / scale_factor;
    }
  }
};

export function healthBarSystem(entMan){
  for (let entity of entMan.get_with(['model', 'health', 'overlay'])){
    if(entity.health < entity.maxhealth){
      if (! gui_healthbar in entity){
        entity.gui_healthbar = get_stat_bar("Red");
      }
      entity.gui_healthbar.width = entity.health / entity.max_health;
      entity.overlay.addControl(entity.gui_healthbar);
    } else {
      entity.gui_healthbar.dispose();
    }
  }
}

export class HUD{
  constructor(scene, entMan, player_data){
    // TODO: Do I actually still need to plumb the scene through here?
    // Remove it if not
    this.adt = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    this.entMan = entMan; // TODO: Should we just pass this?
    this.player_data = player_data;
    
    this.fuel_status = this.get_status_bar(150, "10px", "blue", () => {return player_data.fuel / player_data.max_fuel()} )
    this.nav_text = get_text();
    this.radar_box = this.get_radar_box();
    this.nav_box = this.get_nav_box();
    this.spob_label = this.get_spob_label();
    this.target_label = this.get_target_label();
  }

  get_spob_label(){
    let block = get_text();
    this.adt.addControl(block);
    // TODO: Derive link offset Y from planet graphic size
    // TODO: Brackets?
    block.linkOffsetY = 160;
    return block;
 }

 get_target_label(){
   let block = get_text();
   this.adt.addControl(block);
   // TODO: Health bar - compare health to max health, shields to max shields
   block.linkOffsetY = 25;
   return block;
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

  get_overlay_texture(entity){
    // Makes an overlay texture for the entity to draw target brackets,
    // health bars, etc.
    console.log("got overlay texture");
    let overlay = this.get_box_generic("200px", "200px");
    this.adt.addControl(overlay);
    overlay.linkWithMesh(entity.model);
    return overlay;
  }

  get_nav_box(){
    let box = this.get_box_generic("200px", "80px");

    box.addControl(this.nav_text);
    box.addControl(this.fuel_status);
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

  update(){
    let possible_player = this.entMan.get_with(['input']);
    let player = possible_player[0];
    let planet_line = "In-System: ";
    let jump_line = "Galactic: ";
    this.fuel_status.update_func();
    if (this.player_data.selected_spob){
      planet_line += this.player_data.selected_spob;
      let possible_spobs = this.entMan.get_with_exact("spob_name", this.player_data.selected_spob)
      if(possible_spobs.length > 0){
        let spob = possible_spobs[0];
        spob.model.isDisposed = () => { return false }; // Hack
        this.spob_label.text = spob.spob_name;
        this.spob_label.linkWithMesh(spob.model);
      } else {
        this.spob_label.text = "";
      }
    }

    if (player && player.target){
      let possible_target = this.entMan.get(player.target);
      if(possible_target){
        this.target_label.text = possible_target.short_name;
        this.target_label.linkWithMesh(possible_target.model);
      } else {
        this.target_label.text = "";
      }
    }


    if (this.player_data.selected_system){
      jump_line += this.player_data.selected_system;
    }
    this.nav_text.text = [planet_line, jump_line, ""].join("\n")
  }

  dispose(){
    // Make sure we dispose everything we made and clear globals
    this.adt.dispose();
  }

  get_status_bar(max_width, height, color, update){
    // This gives you a status bar which will evaluate the function
    // given in update to get a percentage width.
    let box = new BABYLON.GUI.Rectangle();
    box.height = height;
    box.width = "10px";
    box.max_width = max_width;
    box.get_status = update;
    box.alpha = 1;
    box.background = color;
    box.color = color;
    box.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    box.verticalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_TOP;

    // Syntactically we want to use `function` because of how `this` behaves.
    // (I think...)
    function update_func(){
      //console.log(this);
      //console.log(this.get_status());
      this.width = "" + (max_width * this.get_status()) + "px";
    }

    box.update_func = update_func;

    return box;
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
