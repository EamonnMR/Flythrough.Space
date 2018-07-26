import { ViewState } from "./states.js";
import { bindInputFunctions, unbindInputFunctions } from "./input.js";

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
const SELECTED_CIRCLE_SIZE = CIRCLE_SIZE_INT + 4;

const SELECTED_SPACELANE_THICKNESS = 2;
const SPACELANE_COLOR = "Gray";

const nogov_color = '#AFAFAF';
const nogov_dark = '#A9A9A9';

export class MapView extends ViewState{
  constructor(data, position, game_canvas, player){
    super();

    this.player = player;
    this.data = data;
    this.scale_factor = 1;
    //this.diff = {x: game_canvas.width() / 2, y: game_canvas.height() / 2};

    this.offset = { x: position.x,
                    y: position.y};
    this.scrollables = [];
    this.game_canvas = game_canvas;

    this.selection = player.selected_system;
  }

  enter(){
    this.dragging = false;
    console.log("Entering map state")

    let current = this.data.systems[this.selection];

    this.adt =  BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    this.map_image = new BABYLON.GUI.Rectangle();


    this.map_image.height = MAP_MAX_SIZE;
    this.map_image.width = MAP_MAX_SIZE;

    this.adt.addControl(this.map_image);

    this.create_spacelanes();
    
    this.make_in_system_dot();

    this.make_selection_circle();
    // Set up color fills for map drawing
    let govt_colors = {};
    let govt_dark_colors = {};

    for (let name of Object.keys(this.data.govts)){
      govt_colors[ name ] = this.data.govts[ name ].color;
      // TODO: Why aren't dark colors working?
      govt_dark_colors[ name ] = this.data.govts[ name ].dark_color;
    }

    for ( let system_name of Object.keys(this.data.systems)) {
      let system_dat = this.data.systems[system_name];

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
      
      

      // Determine the color of the circle based on government, if its empty
      let color = null;
      let is_light = 'spobs' in system_dat;
      
      if( "govt" in system_dat ){
        color = is_light ? govt_colors[system_dat.govt] : govt_dark_colors[system_dat.govt];
      } else {
        color = is_light ? nogov_color : nogov_dark;
      }

      let sys_circle = this.get_circle(
          system_dat.x,
          system_dat.y,
          CIRCLE_SIZE_INT,
          color,
          CIRCLE_THICKNESS,
          Z_SYSCIRCLE,
      )
      /*
       * This ought to work. What's more, it should be nicer
       * than brute forcing all of the circles.
       * 
       * But try, comment this out - it won't work. Or, rather
       * it will work on the first four or so systems you
       * assign a listener to and nothing else.
      sys_circle.onPointerDownObservable.add((event) => {
        console.log(event);
        this.update_selection(system_name);
      });
      */
      this.map_image.addControl(sys_circle);
    }
    this.map_sub = null;

    this.setup_dragging();
    console.log("Finished entering map");

  }

  update_selection( system_name ){
    this.selection = system_name;
    console.log( "Selected: " + this.selection );
    let sel_system = this.data.systems[system_name];
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
    // Expects this.data and this.map_image
    let in_system = this.data.systems[this.player.current_system];
    console.log(Object.keys(this.data.systems));
    console.log(this.player);
    let in_system_dot = this.get_circle(
        in_system.x, in_system.y,
        IN_SYS_CIRCLE_SIZE,
        IN_SYS_COLOR, CIRCLE_THICKNESS,
        Z_IN_DOT,
    );

    this.map_image.addControl(in_system_dot);
  }

  make_selection_circle(){
    let sel_system = this.data.systems[this.selection];
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

  create_spacelanes(){
    let already_done = []; // Any system which already has its lines drawn should have no further lines drawn
    this.spacelanes = []; // These will be moved later, so we need a pointer to them
    for ( let system_name of Object.keys(this.data.systems)) {
      let system_dat = this.data.systems[system_name];
      for (let other_system_id of system_dat.links ){
        if (!(other_system_id in this.data.systems)) {
          console.log('bad link: ' + system_name + ' -> ' + other_system_id);
        } else if (!(other_system_id in already_done)){
          let other_system = this.data.systems[other_system_id];
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
    
    bindInputFunctions({
      toggle_pause: () => {
        'exit map'
        this.parent.enter_state('gameplay');
      },
      reset_game: () => {},
      hyper_jump: () => {},
    });
    this.map_image.onPointerDownObservable.add( (event) => {
      console.log("mouse down");
      let coordinates = this.parse_event(event);  
      this.dragging = true;
      this.mouse_pos = coordinates;
    });
    this.map_image.onPointerUpObservable.add( (event) => {
      console.log("mouse up");
      this.dragging = false;
      let coordinates = this.parse_event(event);  
      // Original map code
      // TODO: Replace this with the above nice code...
      // if it can be made to, like, work.
      for ( let system_name of Object.keys(this.data.systems)) {
        let system_dat = this.data.systems[system_name];
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
      console.log(this.dragging);
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
    /*return {
      x: event.pageX,
      y: event.pageY,
    }*/
  }

  exit(){
    unbindInputFunctions();
    this.player.selected_system = this.selection
    this.adt.removeControl(this.map_image);
    this.map_image.dispose();
  }

};
