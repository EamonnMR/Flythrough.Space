import {
  BaseLandingMenuView
} from "./landing.js";


import { TextButton, TextBox, Image, Widget} from "./menu.js";

const LIST_SPACING = 7;

export class StoreMenu extends BaseLandingMenuView {
  constructor(spobs, player_data, items){
    super();
    this.spobs = spobs;
    this.player_data = player_data;
    this.selected = null;
    this.scroll_offset = 0;
    this.items = items; // Items should be the data set of the type
    // of item the store sells.
  }
  enter(){
    this.spob = this.spobs[this.player_data.current_spob];
    this.setup_menu(
      this.get_detail_widgets().concat(
        this.get_list_widgets().concat(
          this.get_misc_widgets()
        )
      )
    );
  }

  do_buy(){
    /* This gets called by the buy button. */
  }

  get_available_items(){
    /* This lets you list the items (and indeed type of items) available
     * An object where the keys are the canonical name of the item should
     * be returned.*/
  }

  can_purchase_item(){
    /*
     * Use this method to decide if the buy button should be hilighted and
     * if a purchase should go through.
     */
  }
  get_detail_widgets(){
    return [
      new StoreitemName(),
      new StoreitemDesc(),
      new BuyButton(() => {
        do_buy();
      }),
      new QuantBar(
        "-20%", "-30%", 30, "Top Speed", (item) => {
          return item.maxSpeed;
        }
      ),
      new QuantBar(
        "-20%", "-24%", 30, "Acceleration", (item) => {
          return item.accel;
        }
      ),
    ];
  }

  select(item_id){
    this.selected = item_id;
    this.update_widgets();
  }

  scroll(amount){
    this.scroll_offset += amount;
    this.update_widgets();
  }

  current_item(){
    if(this.selected == null){
      // If we don't have a selection, just select the first one
      this.selected = Object.keys(this.get_available_items())[0];
    }
    return this.items[this.selected];
  }

  get_list_widgets(){
    let offset = 0;
    let widgets = [
      new ScrollUpButton( () => {
        this.scroll(10);
      }),
      new ScrollDownButton( () => {
        this.scroll(-10);
      }),
    ];
    Object.keys(this.get_available_items()).forEach((key) => {
      offset += LIST_SPACING;
      widgets.push(this.get_selection_tab_widget(key, this.items[key], offset));
    });
    return widgets;
  }
}

class StoreImage extends Image {
  setup(){
    let control = super.setup();
    control.width = "40%";
    control.height = "40%"; 
    control.alignment_x = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
  }
}

class StoreitemName extends TextBox {
  constructor(){
    super(
      " ",
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT,
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP,
      "5%",
      "5%",
    );
  }

  setup(){
    let control = super.setup();
    control.color = "White";
    control.width = "40%";
    control.height = "10%";
    return control;
  }

  update(parent){
    this.control.text = parent.current_item().short_name;
  }
}

class StoreitemDesc extends TextBox {
  constructor(){
    super(
      " ",
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT,
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP,
      "-10%",
      "20%",
    );
  }

  setup(){
    let control = super.setup();
    control.color = "White";
    control.width = "40%";
    control.height = "40%";
    control.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    control.textWrapping = true;
    return control;
  }

  update(parent){
    this.control.text = parent.current_item().desc;
  }
};


class BuyButton extends TextButton {
  constructor(callback){
    super("Buy", callback,
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT,
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP,
      "-30%",
      "5%",
    )
  }

  setup(){
    let control = super.setup();
    control.height = "8%";
    control.width = "10%";
    control.cornerRadius = 3;
    return control;
  }

  update(parent){
    let color = "Gray";
    if(parent.can_purchase_item(parent.current_item())){
      color = "Green";
    }
    this.control.color = color;
  }
}

class ScrollUpButton extends TextButton {
  constructor(callback){
    super("^", callback,
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT,
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP,
      "2%",
      "2%",
    )
  }

  setup(){
    let control = super.setup();
    control.height = "3%";
    control.width = "3%";
    control.cornerRadius = 3;
    return control;
  }
}

// Broswer, forgive me
class ScrollDownButton extends TextButton {
  constructor(callback){
    super("v", callback,
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT,
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
      "2%",
      "-2%",
    )
  }

  setup(){
    let control = super.setup();
    control.height = "3%";
    control.width = "3%";
    control.cornerRadius = 3;
    return control;
  }
}

class QuantBar extends Widget {
  /* Show some quantifyable quality of an item.
   * Subclass and override "get_stat_of_interest(item)
   * to use.
   */
  constructor(left, top, max_width, name, get_stat_func){
    super();
    this.parent = parent;
    this.top = top;
    this.left = left;
    // TODO: Parameterize this
    this.alignment_x = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.alignment_y = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    this.offset_x = 0;
    this.get_stat_func = get_stat_func;
    this.max_width = max_width;
    this.value_max = null;
    this.name = name;
  }

  setup(){
    let control = new BABYLON.GUI.Rectangle();
    this.setup_control(control);
    control.height = "5%";
    control.width = "" + this.max_width + "%";
    control.color = "white";


    this.actual_width_bar = new BABYLON.GUI.Rectangle();
    this.actual_width_bar.height = "80%";
    this.actual_width_bar.width = "1%";
    this.actual_width_bar.background = "Red";
    this.actual_width_bar.color = "Red";
    control.addControl(this.actual_width_bar);
    this.actual_width_bar.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

    this.label = new BABYLON.GUI.TextBlock();
    this.label.color = "White";
    this.label.text = this.name;
    return control;
  }

  get_max(parent){
    let value_max = 0;
    Object.keys(parent.items).forEach( (key) => {
      let stat = this.get_stat_func( parent.items[key] );

      if (stat > value_max){
        value_max = stat;
      }
   });
   return value_max;
  }

  format_label(value){
    return name + ": " + value; 
  }

  update(parent){
    // Because we're only passed the parent during updates, we need to get
    // the value max on the first update
    if(this.value_max === null){
      this.value_max = this.get_max(parent);
    }

    let value = this.get_current_value(parent); 

    this.actual_width_bar.width = "" + (100 * (value / this.value_max)) + "%";
    this.label.text = this.format_label(value);
  }

  get_current_value(parent){
    return this.get_stat_func(parent.current_item());
  }
}
