import { StoreMenu, StoreitemName, StoreitemDesc, BuyButton, QuantBar, StoreQuantLabel } from "./store.js";

import { TextButton, TextBox, Image} from "./menu.js";


export class UpgradeMenu extends StoreMenu {
  constructor(spobs, player_data, items, data){
    super();
    this.spobs = spobs;
    this.player_data = player_data;
    this.selected = null;
    this.scroll_offset = 0;
    this.items = items; // Items should be the data set of the type
    // of item the store sells.
    this.data = data;
  }

  
  do_buy(){
    let item = this.current_item();
    if (this.can_purchase_item(item)){
      console.log("bought the " + this.selected);
      this.player_data.buy_upgrade(this.selected, item, 1);
    }
  }

  get_available_items(){
    // TODO: Filter by tech
    return this.items;
  }

  can_purchase_item(item){
    return this.player_data.can_buy_upgrade(item.price, item, 1, this.data)
  }

  get_selection_tab_widget(key, item, offset){
    return new UpgradeTab(item,
      item.name,
      item.price,
      offset,
      () => {this.select(key);}
    )
  }

  get_qualities(){
    return [
      {"label": "Price", "function": (item) => {return item.price;}},
      {"label": "Space", "function": (item) => {return -1 * item.space;}},
      {"label": "Shield Damage", "function": (item) => {
        if ( item.weapon && item.weapon.proj){
          return item.weapon.proj.shield_damage;
        }
      }},
      {"label": "Hull Damage", "function": (item) => {
        if (item.weapon && item.weapon.proj){
          return item.weapon.proj.damage;
        }
      }},
    ]
  }


}

// TODO: This really needs a refactor

class UpgradeTab extends TextButton {
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
      //too_expensive = parent.player_data.can_buy_new_ship(this.price);
      current_selection = parent.selection == this.item; 
    }

    if (current_selection){
      return "*" + this.name + " - " + this.price + "*";
    } else {
      return this.name + " - " + this.price;
    }
  }
};

