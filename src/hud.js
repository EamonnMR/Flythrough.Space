import { _ } from "./singletons.js";
import { get_text } from "./util.js"

const DEFAULT_GOVT_NAME = "Independant";
const TARGET_PIP_SIZE = "10px";
const TARGET_PIP_RADIUS = 30;
const ALERT_DURATION = 7000;
const BOX_SIZE = "200px";


export class HUD{
  constructor(){
    this.adt = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    this.spob_label = this.get_spob_label();
    this.widgets = {
      alert_box: new AlertBox(this.adt),
      radar_box: new RadarBox(this.adt),
      target_box: new TargetBox(this.adt),
      status_box: new StatusBox(this.adt),
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
    //  entity.gui_healthbar = get_status_bar(20, "10%", "Red", () => {
    //    return entity.hitpoints / entity.max_hp;
    //});
    return overlay;
  }

  update(){
    let player = _.entities.get_player_ent();
    if (_.player.selected_spob){
      let possible_spobs = _.entities.get_with_exact("spob_name", _.player.selected_spob)
      if(possible_spobs.length > 0){
        let spob = possible_spobs[0];
        spob.model.isDisposed = () => { return false }; // Hack
        this.spob_label.text = spob.spob_name;
        this.spob_label.linkWithMesh(spob.model);
      } else {
        this.spob_label.text = "";
      }
    }

    this.update_widgets();

    if (player){
      if (player.target){
        let possible_target = _.entities.get(player.target);
        if(possible_target){
          this.update_target_pips(
            possible_target,
            color_for_entity(possible_target, player)
          );
        }
      }
    }
  }

  update_target_pips(target, color){
    for(let pip of Object.values(this.target_pips)){ 

      pip.background = color;
      target.overlay.addControl(pip);
    }
  }

  dispose(){
    // Make sure we dispose everything we made and clear globals
    this.each_widget((widget) => {widget.dispose()})
    this.adt.dispose();
  }
  
  each_widget( func ){
    Object.values(this.widgets).forEach(func);
  }

  update_widgets(){
    this.each_widget((widget) => {widget.update()});
  }
};


export function hudUpdateSystem(entMan){
  if(_.hud){
    _.hud.update();
  }
}

class HudWidget {
  constructor(adt){
    // Create widget, add it to the ADT, set its position
  }

  update(){
    // Update the widget
  }

  dispose(){
    // If anything won't be disposed by disposing the adt, do it here
  }
}

export function radarFollowSystem(entMan){
  // Makes radar pips follow entities.
  // TODO: Color pips based on AI status towards player.
  let scale_factor = 5;
  let offset = {x: 100, y:100};
  let player = _.entities.get_player_ent();
  if(player && player.position){
    for (let entity of _.entities.get_with(['position', 'radar_pip'])){
      // Position, relative to the player, inverted
      entity.radar_pip.left = (entity.position.x - player.position.x) / (-1 * scale_factor);
      entity.radar_pip.top = (entity.position.y - player.position.y) / scale_factor;
      entity.radar_pip.color = color_for_entity(entity, player);
    }
  }
};

class RadarBox extends HudWidget{
  constructor(adt){
    super(adt);
    this.box = get_box_generic(BOX_SIZE, BOX_SIZE);

    adt.addControl(this.box);
    this.box.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.box.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
  }

  get_pip(size, color){
    /* Defines the style for Radar Pips */
    let pip = new BABYLON.GUI.Ellipse();
    let str_size = size + "px";
    pip.height = str_size;
    pip.width = str_size;
    pip.background = "Black";
    pip.color = color;
    pip.thickness = 2;
    pip.zIndex = 1
    this.box.addControl(pip);
    return pip;
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

  update(){
    if(this.timer >= 0){
      this.timer -= _.entities.delta_time;
      if(this.timer < 0){
        this.text.text = " ";
        this.timer = 0;
        this.priority = 0;
        this.box.alpha = 0;
      }
    }
  }
}

class TargetBox extends HudWidget{
  constructor(adt){
    super(adt);
    this.box = get_box_generic(BOX_SIZE, BOX_SIZE);

    this.label = get_text();
    this.govt = get_text();
    this.subtitle = get_text();

    this.health_bar = get_status_bar(150, "10px", "red", (target) => {
      if(target){
        return target.hitpoints / target.max_hp; 
      }
    });
    this.shield_bar = get_status_bar(150, "10px", "blue", (target) => {
      if(target){
        return target.shields / target.max_shields;
      }
    });

    this.box.addControl(this.label);
    this.box.addControl(this.govt);
    this.box.addControl(this.subtitle);
    this.box.addControl(this.health_bar);
    this.box.addControl(this.shield_bar);
    this.label.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    this.health_bar.top = 20;
    this.govt.top = 30;
    this.subtitle.top = 40;
    adt.addControl(this.box);
    this.box.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.box.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
  }

  update(){
    let player = _.entities.get_player_ent();
    if (player && player.target){
      let possible_target = _.entities.get(player.target);
      this.health_bar.update_func(possible_target);
      this.shield_bar.update_func(possible_target);
      if(possible_target){
        let target = possible_target;
        // Factor out into a call_if_target( (target) => {func
        // maybe?
        this.label.text = target.short_name;
        this.subtitle.text = "";

        if(target.disabled){
          this.subtitle.text = "disabled" // TODO: Variants?
        }
        
        if( "govt" in target ){
          this.govt.text = _.data.govts[target.govt].short_name;
        } else {
          this.govt.text = DEFAULT_GOVT_NAME;
        }
      } else {
        this.label.text = "<No Target>";
        this.subtitle.text = " ";
        this.govt.text = " ";
      }

    }
  }
}

class StatusBox extends HudWidget{
  constructor(adt){
    super(adt);
    this.fuel_status = get_status_bar(150, "10px", "green", () => {
      let player_ent = _.entities.get_player_ent();
      if(player_ent) {
        return player_ent.fuel / player_ent.max_fuel
      } else {
        return 0
      }
    })
    this.health_status = get_status_bar(150, "10px", "blue", () => {
      let player_ent = _.entities.get_player_ent();
      if(player_ent){
        return player_ent.shields / player_ent.max_shields;
      } else {
        return 0
      }
    })
    this.shield_status = get_status_bar(150, "10px", "red", () => {
      let player_ent = _.entities.get_player_ent();
      if (player_ent){
        return player_ent.hitpoints / player_ent.max_hp
      } else {
        return 0
      }
    })
    this.nav_text = get_text();
    let box = get_box_generic(BOX_SIZE, BOX_SIZE);

    box.addControl(this.nav_text);
    box.addControl(this.fuel_status);
    box.addControl(this.shield_status);
    box.addControl(this.health_status);
    
    this.shield_status.top = 20
    this.health_status.top = 40

    this.nav_text.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
    
    this.nav_text.top = 40
    adt.addControl(box); 
    box.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    box.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    this.box = box;

  }
  update(){
    this.fuel_status.update_func();
    this.shield_status.update_func();
    this.health_status.update_func();

    let jump_nav = ''

    if (_.player.selected_system){
      if(_.player.system_explored(_.player.selected_system)){
        jump_nav += _.player.selected_system;
      } else {
        jump_nav += "Unexplored";
      }
    }
    this.nav_text.text = (`Stellar: ${_.player.selected_spob || ''} \n` +
                          `Galactic: ${jump_nav}`);
  }
}

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
  if('team-asteroids' in entity){
    return 'brown'
  }
  return 'yellow';
}

// This is for drawing health bars over each entity. Not in the design atm.
//export function healthBarSystem(entMan){
//  for (let entity of _.entities.get_with([ 'hitpoints', 'max_hp', 'gui_healthbar'])){
//    // TODO: Hide health bar if health == max_hp 
//    entity.gui_healthbar.update_func();
//  }
//}

function get_status_bar(max_width, height, color, update){
  // This gives you a status bar which will evaluate the function
  // given in update to get a percentage width.
  //
  // Sort of a class. Also sort of gross.
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
  function update_func(data){
    this.width = "" + (max_width * this.get_status(data)) + "px";
  }

  box.update_func = update_func;

  return box;
}
