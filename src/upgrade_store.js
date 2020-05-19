import { _ } from "./singletons.js";
import { StoreMenu, StoreitemName, StoreitemDesc, BuyButton, QuantBar, StoreQuantLabel } from "./store.js";

import { TextButton, TextBox, Image} from "./menu.js";


export class UpgradeMenu extends StoreMenu {
  constructor(){
    super();
    this.items = _.data.upgrades;
  }

  enter(){
    this.spob = _.data.spobs[_.player.current_spob];
    this.ship = _.player.flagship;
    this.setup_widgets();
  }
  
  do_buy(){
    let item = this.current_item();
    if (this.can_purchase_item(item)){
      this.ship.buy_upgrade(this.selected, 1);
    }
    this.update_widgets();
  }

  do_sell(){
    let item = this.current_item();
    if (this.can_sell_item(item)){
      this.ship.sell_upgrade(item.type, 1);
    }
    this.update_widgets();
  }

  can_purchase_item(item){
    return this.ship.can_buy_upgrade(item.price, item, 1)
  }

  can_sell_item(item){
    return this.ship.can_sell_upgrade(item.price, item, 1)
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
    // control.text = this.format_name(null);
    return control;
  }

  update(parent){
    this.set_text(this.format_name(parent)); 
    this.control.top = "" + (this.offset + parent.scroll_offset) + "%";
  }

  get_count(parent){
    // console.log(`Get count for ${this.item.type}: ${parent !== null && parent.ship.upgrades[this.item.type]}: ${parent} && ${parent ? parent.ship.upgrades[this.item.type] : "---"}`);
    if(parent && parent.ship.upgrades[this.item.type]){
      console.log(`Should have a text thing: ${this.item.type}: ${parent.ship.upgrades[this.item.type]}`)
      return `(${parent.ship.upgrades[this.item.type]})`
    }
    return ``
  }

  format_name(parent){
    let too_expensive = null;
    let current_selection = null;
    if(parent !== null){
      //too_expensive = parent.player_data.can_buy_new_ship(this.price);
      current_selection = parent.selection == this.item; 
    }
    return `${current_selection ? "*" : " "}${this.name} - ${this.price} ${this.get_count(parent)}`
  }
};

