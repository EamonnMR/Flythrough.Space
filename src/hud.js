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


// This is for drawing health bars over each entity. Not in the design atm.
//export function healthBarSystem(entMan){
//  for (let entity of entMan.get_with([ 'hitpoints', 'max_hp', 'gui_healthbar'])){
//    // TODO: Hide health bar if health == max_hp 
//    entity.gui_healthbar.update_func();
//  }
//}

export class HUD{
  constructor(scene, entMan, player_data){
    // TODO: Singleton. 
    this.adt = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    this.entMan = entMan; // TODO: Should we just pass this?
    this.player_data = player_data;
    
    this.fuel_status = this.get_status_bar(150, "10px", "blue", () => {return player_data.fuel / player_data.max_fuel()} )
    this.nav_text = get_text();
    this.radar_box = this.get_radar_box();
    this.nav_box = this.get_nav_box();
    this.spob_label = this.get_spob_label();
    this.target_label = get_text();
    this.target_health_bar = this.get_status_bar(150, "10px", "red", () => {
      if(this.ent_target){
        return this.ent_target.max_hp / this.ent_target.hitpoints;
      }
    });
    this.target_shield_bar = this.get_status_bar(150, "10px", "blue", () => {
      if(this.ent_target){
        return this.ent_target.shields / this.ent_target.max_shields;
      }
    });
    this.target_box = this.get_target_box();
  }

  get_spob_label(){
    let block = get_text();
    this.adt.addControl(block);
    // TODO: Derive link offset Y from planet graphic size
    // TODO: Brackets?
    block.linkOffsetY = 160;
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
    let overlay = this.get_box_generic("50px", "50px");
    this.adt.addControl(overlay);
    overlay.linkWithMesh(entity.model);
    //if ("hitpoints" in entity){
    //  entity.gui_healthbar = this.get_status_bar(20, "10%", "Red", () => {
    //    return entity.hitpoints / entity.max_hp;
    //});
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

  get_target_box(){
    let box = this.get_box_generic("200px", "200px");

    box.addControl(this.target_label);
    box.addControl(this.target_health_bar);
    box.addControl(this.target_shield_bar);
    this.target_label.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    this.adt.addControl(box);
    box.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
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
        this.target_ent = possible_target;
        this.target_label.text = this.target_ent.short_name;
      } else {
        this.target_label.text = "<No Target>";
      }
      this.target_health_bar.update_func();
      this.target_shield_bar.update_func();
      // Definitely don't keep a reference around. That would be bad.
      delete this.possible_target;
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
