import { is_cheat_enabled } from "./util.js";
import { ViewState } from "./view_state.js";
import { bindInputFunctions, unbindInputFunctions } from "./input.js";
import { _ } from "./singletons.js";

// Z indices:

const Z_SPACELANE = 1;
const Z_SELECTED_SPACELANE = 2;
const Z_SEL_CIRCLE = 3;
const Z_SYSCIRCLE = 4;
const Z_IN_DOT = 5;
const Z_SYSTEXT = 6;
const Z_OVERLAY = 7;

const MAP_MAX_SIZE = "100%";  // TODO: Calculate this from coordinates

const TEXT_OFFSET = 16;

const CIRCLE_SIZE_INT = 15
const CIRCLE_BACKGROUND = "Black";
const CIRCLE_THICKNESS = 2;
const IN_SYS_CIRCLE_SIZE = CIRCLE_SIZE_INT - 6;
const IN_SYS_COLOR = "Blue";

const SELECTION_COLOR = "#00FF00";
const MISSION_COLOR = "Orange";
const SELECTED_CIRCLE_SIZE = CIRCLE_SIZE_INT + 4;

const SELECTED_SPACELANE_THICKNESS = 2;
const SPACELANE_COLOR = "Gray";

const nogov_color = '#AFAFAF';
const nogov_dark = '#494949';
const UNEXPLORED_COLOR = nogov_dark;

export class MapView extends ViewState{
  constructor(position){
    super();

    this.scale_factor = 1;
    //this.diff = {x: _.canvas.width() / 2, y: _.canvas.height() / 2};

    this.offset = {x: -450, y: -700}; //{ x: position.x,
                  //  y: position.y};
    this.scrollables = [];

    this.selection = null;

    // Pre-calculate faction colors
    this.govt_colors = {};
    this.govt_dark_colors = {};
    for (let name of Object.keys(_.data.govts)){
      this.govt_colors[ name ] = _.data.govts[ name ].color;
      this.govt_dark_colors[ name ] = _.data.govts[ name ].dark_color;
    }
  }

  enter(){
    this.selection = _.player.selected_system;
    this.dragging = false;

    this.adt =  BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    this.map_image = new BABYLON.GUI.Rectangle();


    this.map_image.height = MAP_MAX_SIZE;
    this.map_image.width = MAP_MAX_SIZE;

    this.adt.addControl(this.map_image);

    this.calculate_visible_systems();

    this.create_spacelanes();

    this.create_mission_circles();
    
    this.make_in_system_dot();

    this.make_selection_circle();

    this.create_unexplored_systems();

    this.create_explored_systems();

    this.map_sub = null;

    this.setup_dragging();
    this.move_spacelanes();
    this.move_scrollables();

  }

  create_explored_systems(){
    for ( let system_name of this.explored_systems) {
      let system_dat = _.data.systems[system_name];

      let sys_text = new BABYLON.GUI.TextBlock();
      sys_text.color = "White";
      sys_text.text = system_name;
      sys_text.alpha = 1;
      sys_text.base_left = system_dat.x - (CIRCLE_SIZE_INT / 2);
      sys_text.base_top = TEXT_OFFSET + system_dat.y - (CIRCLE_SIZE_INT / 2);
      sys_text.left = system_dat.x - (CIRCLE_SIZE_INT / 2);
      sys_text.top = TEXT_OFFSET + system_dat.y - (CIRCLE_SIZE_INT / 2);
      sys_text.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      sys_text.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

      this.scrollables.push(sys_text);


      this.map_image.addControl(sys_text);
      sys_text.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      sys_text.zIndex = Z_SYSTEXT;
      
      
      this.make_sys_circle(system_dat, true);

      /*
       * This ought to work. What's more, it should be nicer
       * than brute forcing all of the circles.
       * 
       * But try and comment this in - it won't work. Or, rather
       * it will work on the first four or so systems you
       * assign a listener to and nothing else.
      sys_circle.onPointerDownObservable.add((event) => {
        this.update_selection(system_name);
      });
      */
    }
  }

  create_unexplored_systems(){
    for (let system_name of this.unexplored_systems){
      this.make_sys_circle(_.data.systems[system_name], false);
    }
  }

  make_sys_circle(system_dat, explored){
    if (! system_dat){
      return;
    }
    let color = UNEXPLORED_COLOR;
    
    let is_light = 'spobs' in system_dat;
    if (is_cheat_enabled("show_npcs")){
      is_light = 'npc_average' in system_dat && 'npcs' in system_dat;
    }
    if(explored){  
      if( "govt" in system_dat ){
        color = is_light ? this.govt_colors[system_dat.govt] : this.govt_dark_colors[system_dat.govt];
      } else {
        color = is_light ? nogov_color : nogov_dark;
      }
    }
    let sys_circle = this.get_circle(
        system_dat.x,
        system_dat.y,
        CIRCLE_SIZE_INT,
        color,
        CIRCLE_THICKNESS,
        Z_SYSCIRCLE,
    )
    this.map_image.addControl(sys_circle);
  }

  update_selection( system_name ){
    this.selection = system_name;
    let sel_system = _.data.systems[system_name];
    if(sel_system !== undefined){
      this.selection_circle.base_left = sel_system.x - (SELECTED_CIRCLE_SIZE / 2);
      this.selection_circle.base_top = sel_system.y - (SELECTED_CIRCLE_SIZE / 2);
      this.selection_circle.left = this.offset.x + sel_system.x - (SELECTED_CIRCLE_SIZE / 2);
      this.selection_circle.top = this.offset.y + sel_system.y - (SELECTED_CIRCLE_SIZE / 2);
      this.selection_circle.alpha = 1;
    } else {
      console.log(system_name);
      console.log("not found - invalid selection")
      this.selection_circle.alpha = 0;
    }
  }

  clear_selection(){
    this.selection = null;
    this.selection_circle.alpha = 0;
  }

  get_circle(x, y, size, color, thickness, z_index){
    /* Generic function for the kind of circles you want
     * to use on the map. */ 
    let circle = new BABYLON.GUI.Ellipse();
    circle.base_size = size;
    circle.height = size + "px";
    circle.width = size + "px";
    circle.background = CIRCLE_BACKGROUND; 
    circle.color = color;
    circle.thickness = thickness;
    circle.zIndex = z_index;
    circle.alpha = 1;
    circle.left = x - (size/ 2);
    circle.top = y - (size / 2);
    circle.base_left = x - (size / 2); 
    circle.base_top = y - (size / 2);
    circle.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    circle.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    
    this.scrollables.push(circle);

    return circle;
  }

  make_in_system_dot(){
    // Expects _.data and this.map_image
    let in_system = _.data.systems[_.player.current_system];
    let in_system_dot = this.get_circle(
        in_system.x, in_system.y,
        IN_SYS_CIRCLE_SIZE,
        IN_SYS_COLOR, CIRCLE_THICKNESS,
        Z_IN_DOT,
    );

    this.map_image.addControl(in_system_dot);
  }

  make_selection_circle(){
    let sel_system = _.data.systems[this.selection];
    this.selection_circle = this.get_circle(
       sel_system.y, sel_system.x,
       SELECTED_CIRCLE_SIZE,
       SELECTION_COLOR,
       CIRCLE_THICKNESS,
       Z_SEL_CIRCLE,
    );

    this.map_image.addControl(this.selection_circle);

    this.update_selection(this.selection);
  }

  create_mission_circles(){
    each_mission_system((system_name) => {
      let system = _.data.systems[system_name];
      this.map_image.addControl(
        this.get_circle(
         system.x, system.y,
         SELECTED_CIRCLE_SIZE,
         MISSION_COLOR,
         CIRCLE_THICKNESS,
         Z_SEL_CIRCLE,
        )
      )
    });
  }

  create_spacelanes(){
    let already_done = []; // Any system which already has its lines drawn should have no further lines drawn
    this.spacelanes = []; // These will be moved later, so we need a pointer to them
    for ( let system_name of this.explored_systems) {
      let system_dat = _.data.systems[system_name];
      for (let other_system_id of system_dat.links ){
        if (!(other_system_id in _.data.systems)) {
          console.log('bad link: ' + system_name + ' -> ' + other_system_id);
        } else if (!(other_system_id in already_done)){
          let other_system = _.data.systems[other_system_id];
          // TODO: Add a line
          let spacelane = new BABYLON.GUI.Line();
          spacelane.color = SPACELANE_COLOR;
          spacelane.zOrder = Z_SPACELANE;

          // Here I'm hanging data off of the object
          // These aren't standard members
          // in this.move_spacelanes we use the base and the
          // offset to determine the real position
          // because when you move the parent object the lines
          // are still in screen space >:(
          spacelane.base_x1 = system_dat.x;
          spacelane.base_y1 = system_dat.y;
          spacelane.base_x2 = other_system.x;
          spacelane.base_y2 = other_system.y;

          spacelane.x1 = system_dat.x;
          spacelane.y1 = system_dat.y;
          spacelane.x2 = other_system.x;
          spacelane.y2 = other_system.y;
          
          this.spacelanes.push(spacelane);
          this.map_image.addControl(spacelane);
        }
      }
      already_done.push(system_name); // TODO: Normalize the data
      // Two way links are gross

    }
  }

  calculate_visible_systems(){
    if (is_cheat_enabled("reveal_map")){
      this.explored_systems = Object.keys( _.data.systems);
    } else {
      this.explored_systems = _.player.explored;
    }
    this.unexplored_systems = [];
    for( let system of this.explored_systems ){
      for( let link of _.data.systems[system].links ){
        this.push_unexplored_system(link);
      }
    }

    each_mission_system((mission_system) => {
      this.push_unexplored_system(mission_system);
    });

    this.visible_systems = this.explored_systems.concat(this.unexplored_systems);
  }

  push_unexplored_system(system){
    if (!this.explored_systems.includes(system) && !this.unexplored_systems.includes(system)){
      this.unexplored_systems.push( system );
    }
  }

  move_spacelanes(){
    for(let line of this.spacelanes){
      line.x1 = line.base_x1 + this.offset.x;
      line.y1 = line.base_y1 + this.offset.y;
      line.x2 = line.base_x2 + this.offset.x;
      line.y2 = line.base_y2 + this.offset.y;
    }
  }

  move_scrollables(){
    for (let circle of this.scrollables){
      circle.left = circle.base_left + this.offset.x;
      circle.top = circle.base_top + this.offset.y;
    }
  }

  setup_dragging(){
    this.dragging = false;

    this.map_image.isPointerBlocker = true;
    
    bindInputFunctions({
      toggle_pause: () => {
        // TODO: Store previous state, letting us to back to msn
        // screen
        this.parent.enter_state('gameplay');
      },
    });
    this.map_image.onPointerDownObservable.add( (event) => {
      let coordinates = this.parse_event(event);  
      this.dragging = true;
      this.mouse_pos = coordinates;
    });
    this.map_image.onPointerUpObservable.add( (event) => {
      this.dragging = false;
      let coordinates = this.parse_event(event);  
      // Original map code
      // TODO: Replace this with the above nice code...
      // if it can be made to, like, work.
      for ( let system_name of this.visible_systems) {
        let system_dat = _.data.systems[system_name];
        //Ugly brute force clicking-on-system check
        //Treats the map circles as squares
        if(
            Math.abs(
              coordinates.x - this.offset.x - system_dat.x)
              < CIRCLE_SIZE_INT
            && Math.abs(
              coordinates.y - this.offset.y - system_dat.y)
              < CIRCLE_SIZE_INT
        ){
          this.update_selection(system_name);
          break;
        }
      }
    });
    this.map_image.onPointerMoveObservable.add( (event) => {
      let coordinates = this.parse_event(event);  
      if ( this.dragging ) {
        this.offset.x +=  coordinates.x - this.mouse_pos.x;
        this.offset.y +=  coordinates.y - this.mouse_pos.y;
        this.mouse_pos.x = coordinates.x;
        this.mouse_pos.y = coordinates.y;
        this.move_spacelanes();
        this.move_scrollables();
      }
    });

  }

  parse_event(event){
    return event
  }

  exit(){
    unbindInputFunctions();
    _.player.selected_system = this.selection
    this.adt.removeControl(this.map_image);
    this.map_image.dispose();
  }

};

function each_mission_system(callback){
  console.log("Missions:");
  console.log(Object.keys(_.player.active_missions));
  for(let mission_name of Object.keys(_.player.active_missions)){
    let mission = _.player.active_missions[mission_name];
    if(mission.dest && mission.dest.sys){
      callback(mission.dest.sys);
    }
  }
}
