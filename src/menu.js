import * as states from "states"

export class BaseMenuView extends states.ViewState {
  setup_menu(widgets){
    this.adt = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    this.widgets = widgets;
    for (let widget of widgets){
      let control = widget.get_control();
      this.adt.addControl(control);
    }
    this.update_widgets();
  }

  exit(){
    for(let widget of this.widgets){
      widget.hide(this);
    }
  }

  update_widgets(){
    for(let widget of this.widgets){
      widget.update(this);
    }
  }
}


export class Widget{
  setup(){
    // Each time you enter this menu state, this will be called on your widget.
    // It should return a control, which will be added to the
    // parent container and saved into the control.
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

  get_control(){
    // Wraps "setup" and saves the control so that the 
    // widget can update it later.
    this.control = this.setup();
    return this.control;
  }

  update(parent){
    // For setting up binding
  }

  // Convenience functions
  show(parent){
    parent.adt.addControl(this.control);
  }

  hide(parent){
    parent.adt.removeControl(this.control);
  }

}

export class TextButton extends Widget{
  constructor(text, callback, alignment_x, alignment_y, left, top){
    super();
    // TODO: Subclass text probably
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
    control.text = this.text;
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
    control.stretch = BABYLON.GUI.Image.STRETCH_NONE;
    control.autoScale = true;
    return control;
  }
};

