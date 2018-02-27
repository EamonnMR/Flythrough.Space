import * as states from "states"

export class BaseMenuView extends states.ViewState {
  setup_menu(widgets){
    this.adt = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    this.controls = [];
    for (let widget of widgets){
      let control = widget.setup();
      this.adt.addControl(control);
      this.controls.push(control);
    }
  }

  exit(){
    for(let control of this.controls){
      this.adt.removeControl(control);
    }
  }
}


export class Widget{
  setup(){
    // Each time you enter this menu state, this will be called on your widget.
		// The parent is the ADT or container that you will attach the widget to (if applicable)
    // It should return a control, which will be added to the
    // parent container.
  }
  
  setup_control(control){
    /* This assumes that you've set the following params:
     * Alignment x
     * alignment y
     * left
     * top
       And applies those to the given control.
       */

    control.horizontalAlignment = this.alignment_x;
    control.verticalAlignment = this.alignment_y;
    control.top = this.top;
    control.left = this.left;
    control.offset_x = this.offset_x;
  }
}

export class TextButton extends Widget{
  constructor(text, callback, alignment_x, alignment_y, left, top){
    super();
    this.text = text;
		this.alignment_x = alignment_x,
		this.alignment_y = alignment_y,
		this.left = left;
		this.top = top;
    this.callback = callback;
  }

  setup(){
    let control = BABYLON.GUI.Button.CreateSimpleButton(
        "button-"+ this.text,
        this.text);
    this.setup_control(control);
    control.onPointerUpObservable.add(this.callback);
    control.color = "White";
    control.background = "Red";
    control.height = "10%";
    control.width = "25%";
    control.paddingLeft = "5%";
    control.paddingBottom = "8%";
    return control;
  }
}

export class TextBox extends Widget{
  /* TODO: For paragraphs: split by words:
   * current_line = []
   * if len(current_line) + 1 + word > line_len or
   * if word == '\n':
   * Start new line (repeat)
   */
  constructor(text, alignment_x, alignment_y, left, top) {
    super();
    this.text = text;
    this.alignment_x = alignment_x;
    this.alignment_y = alignment_y;
    this.left = left;
    this.top = top;
  }

  setup(){
    let control = new BABYLON.GUI.TextBlock();
    control.color = "White";
    control.text = this.text;
    control.textWrapping = true;
    control.width = "60%";
    control.height = "40%";
    control.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.setup_control(control);
    return control;
  }
} 


export class Image extends Widget{
  constructor(image, alignment_x, alignment_y, left, top){
    super();
    this.alignment_x = alignment_x;
    this.alignment_y = alignment_y;
    this.left = left;
    this.top = top;
    this.image = image;
    
  }

  setup(){
    let control = new BABYLON.GUI.Image();
    this.setup_control(control);
    control.source = this.image;
    // TODO: break this out into a "hero image" class in landing?
    control.width = "60%";
    control.height = "40%";
    control.stretch = BABYLON.GUI.Image.STRETCH_NONE;

    return control;
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
  
