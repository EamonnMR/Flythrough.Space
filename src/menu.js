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
      backgroundFill: "#0000000F"
    });

		this.group = new BABYLON.Group2D({
      parent: this.canvas,
      id: 'menu_group' 
    });
	  console.log("pre pointer event observable");	
	  this.group.pointerEventObservable.add(
      (d, s) => {
        console.log('clicked: ');
        console.log(d.relatedTarget.id);
        let target = d.relatedTarget.id;
        this.respond_to_click(target);
      }, BABYLON.PrimitivePointerInfo.PointerUp

    );
    console.log("Pre widgets")
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

export class TextBox extends Widget{
  /* TODO: For paragraphs: split by words:
   * current_line = []
   * if len(current_line) + 1 + word > line_len or
   * if word == '\n':
   * Start new line (repeat)
   */
  constructor(text, x, y, id, get_width_func){
    super();
    this.text = text;
    this.x = x;
    this.y = y;
    this.id = id;
    this.img = null;
    this.text_size = 18;
    this.text_width = Math.round(this.text_size * .888888888) // TODO: Figure out
    this.get_width_func = get_width_func
  }

  setup(group){
    let line_number = 0
    for (let line of line_break(
          this.text, Math.round(this.get_width_func() / this.text_width))){
      
      new BABYLON.Text2D(line, {
        id: this.id + line.toString(),
        x: this.x,
        y: this.y - ((this.text_size + 2) * line_number),
        fontName: this.text_size.toString() + 'pt Courier',
        parent: group
      });

      line_number += 1;
    }
  }
} 


export class Image extends Widget{
  constructor(texture, x, y){
    super();
    this.texture = texture;
    this.x = x; this.y = y;
    this.sprite = null;
  }

  setup(group){
     this.sprite = new BABYLON.Sprite2D(this.texture,
     {
       parent: group, id: 'hero',// x: this.x, y: this.y, z:1,
       spriteSize: new BABYLON.Size(64, 64),
       align_to_pixel: true
     });
  }
};

export function line_break(text, max_line_width){
  let words = text.split(" ");
  let lines = [];
  let line = "";
  for (let word of words){
    if( word === '\n'){
      lines.push(line);
      line = "";
    } else {
      if(1 + line.length + word.length <= max_line_width){
        line += " " + word;
      } else {
        lines.push(line);
        line = word;
      }
    }
  }

  if (line !== ""){
    lines.push(line);
  }
  
  console.log(lines);
  return lines;
}
  
