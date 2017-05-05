import * as states from "states"

export class MainMenuView extends states.ViewState {
  constructor(scene, dom_canvas){ // TODO: Load list of save games?
    super()
    this.scene = scene;
    this.dom_canvas = dom_canvas;
    this.widgets = {};
    this.canvas = null;
  }

  resize(){
    // Not much to preserve here, so we just re-init the whole state
    this.exit();
    this.enter();
  }

  enter(){
    // You should probably call this in your enter function
    this.setup_2d_canvas();
  }

  setup_2d_canvas(){
    this.canvas = new BABYLON.ScreenSpaceCanvas2D(this.scene, {
      id: "menu_canvas",
      size: new BABYLON.Size(this.dom_canvas.width(),
                             this.dom_canvas.height()),
      backgroundFill: "#4040408F"
    });

		this.group = new BABYLON.Group2D({
      parent: this.canvas,
      id: 'menu_group' 
    });
		
	  this.group.pointerEventObservable.add(
      (d, s) => {
        let target = d.relatedTarget.id;
        this.respond_to_click(target);
      }, BABYLON.PrimitivePointerInfo.PointerUp

    );

    for (let id of Object.keys(this.widgets)){
      this.widgets[id].setup(this.group);
    }
  }

  exit(){
    if(this.canvas){
      this.canvas.dispose();
    }
	}

  respond_to_click(target_id){
    if( target_id in this.widgets ){
      this.widgets[target_id].clicked();
    }
  }
}

export class Widget{
  setup(group){
    // Each time you enter this menu state, this will be called on your widget
    // Remember to set the parent of whatever you create to 'group' if you want
    // it to be clickable.
  }

  clicked(){
    // Do something because the widget was clicked.
  }
}

export class TextButton extends Widget{
  constructor(text, on_click, x, y, id){
    super();
    this.text = text;
    this.on_click = on_click;
    this.x = x;
    this.y = y;
    this.id = id;
    this.img = null;
  }

  setup(group){
    new BABYLON.Text2D(this.text, {
      id: this.id,
      x: this.x,
      y: this.y,
      fontName: '20pt Courier',
      parent: group
    });
  }

  clicked(){
    this.on_click();
  }
}
