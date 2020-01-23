import { _ } from "./singletons.js";
import { get_text } from "./util.js"

const DEFAULT_GOVT_NAME = "Independant";
const TARGET_PIP_SIZE = "10px";
const TARGET_PIP_RADIUS = 30;
const ALERT_DURATION = 7000;
const BOX_SIZE = "200px";

export function radarFollowSystem(entMan){
  // Makes radar pips follow entities.
  // TODO: Color pips based on AI status towards player.
  let scale_factor = 5;
  let offset = {x: 100, y:100};
  let player = entMan.get_player_ent();
  if(player && player.position){
    for (let entity of entMan.get_with(['position', 'radar_pip'])){
      // Position, relative to the player, inverted
      entity.radar_pip.left = (entity.position.x - player.position.x) / (-1 * scale_factor);
      entity.radar_pip.top = (entity.position.y - player.position.y) / scale_factor;
      entity.radar_pip.color = color_for_entity(entity, player);
    }
  }
};

export function hudUpdateSystem(entMan){
  if(_.hud){
    _.hud.update(entMan);
  }
}

export function color_for_entity(entity, player){
  // For targeting purposes, what color to show the target as
  if('ai' in entity && entity.ai.target && entity.ai.target === player.id){
    return 'red';
  }

  if(entity.disabled){
    return 'gray';
  }

  if(entity.player_aligned){
    return 'chartreuse';
  }
  
  if('spob_name' in entity){
    if('govt' in entity){
      if( _.player.is_govt_hostile(entity.govt) ){
        return 'red';
      } else {
        return 'yellow';
      }
    } else {
      return 'gray'
    }
  }
  return 'yellow';
}

// This is for drawing health bars over each entity. Not in the design atm.
//export function healthBarSystem(entMan){
//  for (let entity of entMan.get_with([ 'hitpoints', 'max_hp', 'gui_healthbar'])){
//    // TODO: Hide health bar if health == max_hp 
//    entity.gui_healthbar.update_func();
//  }
//}

class HudWidget {
  constructor(adt){
    // Create widget, add it to the ADT, set its position
  }

  update(entMan){
    // Update the widget
  }
}

class AlertBox extends HudWidget {
  show(text, priority=1, sound=null){
    if(priority >= this.priority){
      // TODO: play sound
      console.log("alert: " + text);
      
      this.text.text = text;
      this.priority = priority;
      this.timer = ALERT_DURATION;
      this.box.alpha = .5
    }
  }

  constructor(adt){
    super(adt);
    this.text = get_text()
    this.timer = 0;
    this.priority = 0;
    

    // TODO: Widget classes
    this.text.text = "";

    this.box = get_box_generic("1000px", "100px");

    this.box.addControl(this.text);
    this.box.paddingLeft = BOX_SIZE; 
    this.box.paddingBottom = "5%";
    this.box.color = "black";
    this.box.alpha = .5;

    adt.addControl(this.box);
    this.box.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.box.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;

  }

  update(entMan){
    if(this.timer >= 0){
      this.timer -= entMan.delta_time;
      if(this.timer < 0){
        this.text.text = " ";
        this.timer = 0;
        this.priority = 0;
        this.box.alpha = 0;
      }
    }
  }
}


export class HUD{
  // TODO: Spin out into class. 


  update_widgets(entMan){
    Object.values(this.widgets).forEach((widget) => {
      widget.update(entMan);
    });
  }

  constructor(){
    this.adt = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    this.tmp_player = null; // Or: how I broke abstraction. This should only exist during update.
    this.fuel_status = this.get_status_bar(150, "10px", "green", () => {
      if(this.tmp_player) {
        return this.tmp_player.fuel / this.tmp_player.max_fuel
      } else {
        return 0
      }
    })
    this.health_status = this.get_status_bar(150, "10px", "blue", () => {
      if(this.tmp_player){
        return this.tmp_player.shields / this.tmp_player.max_shields;
      } else {
        return 0
      }
    })
    this.shield_status = this.get_status_bar(150, "10px", "red", () => {
      if (this.tmp_player){
        return this.tmp_player.hitpoints / this.tmp_player.max_hp
      } else {
        return 0
      }
    })
    this.nav_text = get_text();
    this.radar_box = this.get_radar_box();
    this.nav_box = this.get_nav_box();
    this.spob_label = this.get_spob_label();
    this.target_label = get_text();
    this.target_govt = get_text();
    this.target_subtitle = get_text();

    this.widgets = {
      alert_box: new AlertBox(this.adt)
    };


    // Target pips - attached to the overlay and drawn around the target.
    function get_target_pip(x, y){
      let pip = new BABYLON.GUI.Ellipse();
      pip.width = TARGET_PIP_SIZE;
      pip.height = TARGET_PIP_SIZE;
      pip.left = x * TARGET_PIP_RADIUS; // - (TARGET_PIP_SIZE / 2);
      pip.top = y * TARGET_PIP_RADIUS; // - (TARGET_PIP_SIZE / 2);
      pip.background = "white";
      pip.color = "white"; // TODO: Alter color based on ship status
      pip.thickness = 1;
      pip.zIndex = 3;
      pip.alpha = .5; 
      return pip;
    }

    // TODO: Change target pip radius based on target size
    this.target_pips = {
      bottom: get_target_pip(0, -1.5),
      left: get_target_pip(-2, 1.5),
      right: get_target_pip(2, 1.5),
      //pip: get_target_pip(0,0)
    };

    this.target_health_bar = this.get_status_bar(150, "10px", "red", () => {
      if(this.target_ent){
        return this.target_ent.hitpoints / this.target_ent.max_hp; 
      }
    });
    this.target_shield_bar = this.get_status_bar(150, "10px", "blue", () => {
      if(this.target_ent){
        return this.target_ent.shields / this.target_ent.max_shields;
      }
    });
    this.target_box = this.get_target_box();
  }

  deselect(entity){
    if(entity){
      for(let pip of Object.values(this.target_pips)){
        entity.overlay.removeControl(pip);
      }
    }
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
    let overlay = get_box_generic("140px", "140px");
    // https://forum.babylonjs.com/t/the-other-upgrade-issue-may-actually-be-a-3-2-or-3-3-change-not-4-0/5486/4
    overlay.background = "#0000";
    overlay.color = "#0000";
    this.adt.addControl(overlay);
    overlay.linkWithMesh(entity.model);
    //if ("hitpoints" in entity){
    //  entity.gui_healthbar = this.get_status_bar(20, "10%", "Red", () => {
    //    return entity.hitpoints / entity.max_hp;
    //});
    return overlay;
  }

  get_nav_box(){
    let box = get_box_generic("200px", "200px");

    box.addControl(this.nav_text);
    box.addControl(this.fuel_status);
    box.addControl(this.shield_status);
    box.addControl(this.health_status);
    
    this.shield_status.top = 20
    this.health_status.top = 40

    this.nav_text.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
    
    this.nav_text.top = 40
    this.adt.addControl(box); 
    box.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    box.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    return box

  }

  get_radar_box(){
    let box = get_box_generic("200px", "200px");

    this.adt.addControl(box);
    box.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    box.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    return box;
  }

  get_target_box(){
    let box = get_box_generic("200px", "200px");

    box.addControl(this.target_label);
    box.addControl(this.target_govt);
    box.addControl(this.target_subtitle);
    box.addControl(this.target_health_bar);
    box.addControl(this.target_shield_bar);
    this.target_label.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    this.target_health_bar.top = 20;
    this.target_govt.top = 30;
    this.target_subtitle.top = 40;
    this.adt.addControl(box);
    box.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    box.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;

    return box;
  }

  update(entMan){
    let player = entMan.get_player_ent();
    let planet_line = "In-System: ";
    let jump_line = "Galactic: ";
    if (_.player.selected_spob){
      planet_line += _.player.selected_spob;
      let possible_spobs = entMan.get_with_exact("spob_name", _.player.selected_spob)
      if(possible_spobs.length > 0){
        let spob = possible_spobs[0];
        spob.model.isDisposed = () => { return false }; // Hack
        this.spob_label.text = spob.spob_name;
        this.spob_label.linkWithMesh(spob.model);
      } else {
        this.spob_label.text = "";
      }
    }

    this.update_widgets(entMan);
    if (player){
      // Gross: pipe this down to functions
      this.tmp_player = player

      if (player.target){
        let possible_target = entMan.get(player.target);
        if(possible_target){
          this.target_ent = possible_target;
          this.target_label.text = this.target_ent.short_name;
          let pip_color = "yellow";
          this.target_subtitle.text = "";

          if(this.target_ent.disabled){
            this.target_subtitle.text = "disabled" // TODO: Variants?
          }

          this.update_target_pips(
            this.target_ent,
            color_for_entity(this.target_ent, player)
          );
           
          if( "govt" in this.target_ent ){
            this.target_govt.text = _.data.govts[this.target_ent.govt].short_name;
          } else {
            this.target_govt.text = DEFAULT_GOVT_NAME;
          }
        } else {
          this.target_label.text = "<No Target>";
          this.target_subtitle.text = " ";
          this.target_govt.text = " ";
        }
        this.target_health_bar.update_func();
        this.target_shield_bar.update_func();
        // Definitely don't keep a reference around. That would be bad.
        delete this.possible_target;
      }
    }

    this.fuel_status.update_func();
    this.shield_status.update_func();
    this.health_status.update_func();
    
    this.tmp_player = null;

    if (_.player.selected_system){
      if(_.player.system_explored(_.player.selected_system)){
        jump_line += _.player.selected_system;
      } else {
        jump_line += "Unexplored";
      }
    }
    this.nav_text.text = [planet_line, jump_line, ""].join("\n")
  }

  update_target_pips(target, color){
    for( let pip of Object.values(this.target_pips)){ 

      pip.background = color;
      this.target_ent.overlay.addControl(pip);
    }
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
};

function get_box_generic(width, height){
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
