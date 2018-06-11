import { StoreMenu, StoreitemName, StoreitemDesc, BuyButton, QuantBar, StoreQuantLabel } from "./store.js";

import { TextButton, TextBox, Image} from "./menu.js";


export class ShipyardMenu extends StoreMenu {
  do_buy(){
    if (this.player_data.can_buy_new_ship(this.current_item().price)){
      this.player_data.buy_ship(this.selected, this.current_item());
    }
  }
  get_available_items(){
    // TODO: Filter by tech
    return this.items;
  }

  can_purchase_item(item){
    return this.player_data.can_buy_new_ship(item.price)
  }

  get_selection_tab_widget(key, item, offset){
    return new ShipTab(item,
      item.short_name,
      item.price,
      offset,
      () => {this.select(key);}
    )
  }

  get_qualities(){
    return [
      {"label": "Top Speed", "function": (item) => {return item.maxSpeed;}},
      {"label": "Acceleration", "function": (item) => {return item.accel;}},
      // TODO: Verify
      {"label": "Handling", "function": (item) => {return item.rotation}},
      {"label": "Cargo", "function": (item) => {return item.cargo;}},
      {"label": "Free Mass", "function": (item) => {return item.space;}}
    ]
  }


}

class ShipTab extends TextButton {
  constructor(item, name, price, top, callback){
    super(name + " - " + price, callback,
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT,
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP,
        "4%", "" + top + "%");
    this.item = item;
    this.name = name;
    this.price = price;
    this.offset = top;
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
    this.control.top = "" + (this.offset + parent.scroll_offset) + "%";
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

