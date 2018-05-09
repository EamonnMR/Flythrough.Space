import { BaseLandingMenuView } from "./landing.js";
import { TextButton, TextBox, Image } from "./menu.js";

const LIST_SPACING = 7;

export class ShipyardMenu extends BaseLandingMenuView {
  constructor(spobs, player_data, ships, upgrades){
    super();
    this.spobs = spobs;
    this.player_data = player_data;
    this.ships = ships;
    this.upgrades = upgrades;
    this.selected = null;
  }
  enter(){
    this.spob = this.spobs[this.player_data.current_spob];
    this.setup_menu(
      this.get_detail_widgets().concat(
        this.get_ship_list_widgets().concat(
          this.get_misc_widgets()
        )
      )
    );
  }
  get_detail_widgets(){
    return [
      new StoreitemName(),
      new StoreitemDesc(),
    ];
  }
  get_ship_list_widgets(){
    let offset = 0;
    let widgets = [];
    Object.keys(this.get_available_ships()).forEach((key) => {
      offset += LIST_SPACING;

      widgets.push(
        new ShipTab(this.ships[key], this.ships[key].short_name, this.ships[key].price, "" + offset + "%", () =>
          {this.select_ship(key);}
        )
      );
    });
    return widgets;
  }
  get_available_ships(){
    // TODO: Filter ships by tech and tech of spob
    return this.ships;
  }

  select_ship(ship){
   console.log("Selected: " + ship);
   this.selected = ship;
   this.update_widgets();
  } 

  current_item(){
    if(this.selected == null){
      // If we don't have a selection, just select the first one
      this.selected = Object.keys(this.get_available_ships())[0];
    }
    return this.ships[this.selected];
  }
}
class ShipTab extends TextButton {
  constructor(item, name, price, top, callback){
    super(name + " - " + price, callback,
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT,
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP,
        "4%", top);
    this.item = item;
    this.name = name;
    this.price = price;
  }
  setup(){
    let control = super.setup();
    control.color = "White";
    control.height = "6%";
    control.cornerRadius = 1;
    control.width = "40%";
    control.text = this.format_name(null);
    return control;
  }

  update(parent){
    this.control.text = this.format_name(parent); 
  }

  format_name(parent){
    let too_expensive = null;
    let current_selection = null;
    if(parent !== null){
      too_expensive = parent.player_data.can_buy_new_ship(this.price);
      current_selection = parent.selection == this.item; 
    }

    if (current_selection){
      return "*" + this.name + " - " + this.price + "*";
    } else {
      return this.name + " - " + this.price;
    }
  }
};

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

