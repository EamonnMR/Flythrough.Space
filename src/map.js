import * as states from "states";
import * as input from "input";

// Z indices:

const Z_SPACELANE = 1;
const Z_SELECTED_SPACELANE = 2;
const Z_SYSCIRCLE = 4;
const Z_SELECTION_DOT = 5;
const Z_SYSTEXT = 6;
const Z_OVERLAY = 7;

const MAP_MAX_SIZE = "100%";  // TODO: Calculate this from coordinates

const TEXT_OFFSET = 16;

const CIRCLE_SIZE_INT = 15
const CIRCLE_SIZE = CIRCLE_SIZE_INT + "px";
const CIRCLE_BACKGROUND = "Black";
const CIRCLE_THICKNESS = 2;

const SPACELANE_COLOR = "Gray";

export class MapView extends states.ViewState{
  constructor(data, position, game_canvas, player){
    super();

    this.player = player;
    this.data = data;
    this.scale_factor = 1;
    //this.diff = {x: game_canvas.width() / 2, y: game_canvas.height() / 2};

    /* this.offset = { x: position.x + this.diff.x,
                    y: position.y + this.diff.y };
    this.game_canvas = game_canvas;

    this.canvas = null;
    this.map_image = null;
    */
    this.selection = this.player.selected_system;
  }
  enter(){
    console.log("Entering map state")
    input.bindInputFunctions({
      toggle_pause: () => {
        'exit map'
        this.parent.enter_state('gameplay');
      },
      reset_game: () => {},
      hyper_jump: () => {}
    })

    this.adt = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("Map");

    this.map_image = new BABYLON.GUI.Rectangle();
    this.map_image.height = MAP_MAX_SIZE;
    this.map_image.width = MAP_MAX_SIZE;

    this.adt.addControl(this.map_image);
    
    let current = this.data.systems[this.selection];

    // TODO: Create "current system dot" and selection circle
    /*
		this.selection_img = new BABYLON.Ellipse2D({
      parent: this.map_image,
      id: 'selection',
      x: ( current.x - 10) * this.scale_factor,
      y: (-1 * current.y - 10) *  this.scale_factor,
      width: 20,
      height: 20,
      fill: BABYLON.Canvas2D.GetSolidColorBrushFromHex('#00FFFFFF') 
    });
    */
   
    /*
     * TODO: This can be moved to the individual clickable
     * system circles I think 
    this.map_image.pointerEventObservable.add(
      (d, s) => {
        let target = d.relatedTarget.id;
        if (target.indexOf('_circle') > 0){
          console.log("Clicked: " + target);
          this.move_selection(target.replace('_circle', ''))
        }
      }, BABYLON.PrimitivePointerInfo.PointerUp

    );
    */

    // Set up color fills for map drawing
    let govt_colors = {};
    let govt_dark_colors = {};

    for (let name of Object.keys(this.data.govts)){
      govt_colors[ name ] = this.data.govts[ name ].color;
      // TODO: Why aren't dark colors working?
      govt_dark_colors[ name ] = this.data.govts[ name ].dark_color;
    }

    let nogov_color = '#AFAFAFFF';
    let nogov_dark = '#A9A9A9FF';

    console.log(nogov_color);
    console.log(nogov_dark);

    let circle_size = 10;

    for ( let system_name of Object.keys(this.data.systems)) {
      let system_dat = this.data.systems[system_name];

      let sys_text = new BABYLON.GUI.TextBlock();
      sys_text.color = "White";
      sys_text.text = system_name;
      sys_text.alpha = 1;
      sys_text.left = system_dat.x - (CIRCLE_SIZE_INT / 2);
      sys_text.top = TEXT_OFFSET + system_dat.y - (CIRCLE_SIZE_INT / 2);
      sys_text.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      sys_text.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;


      this.map_image.addControl(sys_text);
      sys_text.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      sys_text.zIndex = Z_SYSTEXT;
      
      //let sys_loc_vec = new BABYLON.Vector2(system_dat.x * this.scale_factor,
      //                                  -1 * system_dat.y * this.scale_factor)
      // TODO: This really should be made less redundant
      
      for (let other_system_id of system_dat.links ){
        if (other_system_id in this.data.systems) {
          let other_system = this.data.systems[other_system_id];
          // TODO: Add a line
          let spacelane = new BABYLON.GUI.Line();
          spacelane.color = SPACELANE_COLOR;
          spacelane.x1 = system_dat.x;
          spacelane.y1 = system_dat.y;
          spacelane.x2 = other_system.x;
          spacelane.y2 = other_system.y;
          spacelane.zOrder = Z_SPACELANE;

          this.map_image.addControl(spacelane);
          
        } else {
          console.log('bad link: ' + system_name + ' -> ' + other_system_id);
        }
      }

      // Determine the color of the circle based on government, if its empty
      let color = null;
      let is_light = 'spobs' in system_dat;
      
      if( "govt" in system_dat ){
        color = is_light ? govt_colors[system_dat.govt] : govt_dark_colors[system_dat.govt];
      } else {
        color = is_light ? nogov_color : nogov_dark;
      }
      
      let sys_circle = new BABYLON.GUI.Ellipse();
      sys_circle.height = CIRCLE_SIZE;
      sys_circle.width = CIRCLE_SIZE;
      sys_circle.background = CIRCLE_BACKGROUND; 
      sys_circle.color = color;
      sys_circle.thickness = CIRCLE_THICKNESS;
      sys_circle.zIndex = Z_SYSCIRCLE;
      sys_circle.alpha = 1;
      sys_circle.left = system_dat.x - (CIRCLE_SIZE_INT / 2);
      sys_circle.top = system_dat.y - (CIRCLE_SIZE_INT / 2);
      sys_circle.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      sys_circle.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

      this.map_image.addControl(sys_circle);
    }
    this.map_sub = null;
    this.draw_position();
    this.move = {x: 0, y: 0};
    this.dragging = false;

    /*
    this.game_canvas.mousedown(() => {
      this.dragging = true;
    });

    this.game_canvas.mouseup(() => {
      this.dragging = false;
    });
    */
    //this.game_canvas.mousemove( (event) => {
      /*
      if ( this.dragging ) {
        this.offset.x -= this.move.x - event.pageX;
        this.offset.y += this.move.y - event.pageY;
        this.draw_position();  // TODO: Does this fix laggyness?
      }

      this.move = {x: event.pageX, y: event.pageY};
      this.map_image.x = this.offset.x;
      this.map_image.y = this.offset.y;
      this.draw_position();
      */
    //});

    console.log("Finished entering map");

  }

  exit(){
    input.unbindInputFunctions();
    /*
    this.game_canvas.unbind('mousedown');
    this.game_canvas.unbind('mouseup');
    this.game_canvas.unbind('mousemove');
    this.canvas.dispose();
    this.player.map_pos = {
      x: this.offset.x - this.diff.x,
      y: this.offset.y - this.diff.y,
    };
    */
    this.player.selected_system = this.selection
  }

  move_selection( system_name ){
    /*
    // TODO: We could probably replace some of the enter code
    // with a call to this
    this.selection = system_name;
    console.log( this.selection );
    let sel_system = this.data.systems[system_name];
    this.selection_img.x = (sel_system.x - 10) * this.scale_factor;
    this.selection_img.y = (-1 * sel_system.y - 10) *  this.scale_factor;
    */
  }

  draw_position(){
    /*
    if (this.map_sub){
      this.map_sub.dispose();
    }
    */
    /*
    this.map_sub = new BABYLON.Text2D('' + this.offset.x + ',' + this.offset.y,
      {
        id: 'map_subtitle',
        x: 0,
        y: 20,
        fontName: '20pt Courier',
        parent: this.canvas
      }
    );
    */
  }
}
