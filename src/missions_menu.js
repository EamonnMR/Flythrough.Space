import { _ } from "./singletons.js";
import { StoreMenu, StoreitemName, StoreitemDesc, BuyButton } from "./store.js";
import { TextButton, TextBox } from "./menu.js";
import { missions_for_spob } from "./missions.js";

export class MissionsMenu extends StoreMenu {
  constructor(){
    super(null);
  }

  enter(){
    this.items = missions_for_spob(_.data.spobs[_.player.current_spob]);
    super.enter();
  }

  get_available_items(){
    return missions_for_spob(_.player.current_spob);
  }
    
  do_buy(){
    if (_.player.can_accept_mission(this.current_item())){
      _.player.accept_mission(this.current_item());
    }
  }

  can_purchase_item(item){
    return _.player.can_accept_mission(this.current_item());
  }

  can_sell_item(item){
    return false;
  }

  get_selection_tab_widget(key, item, offset){
    return new MissionTab(item, item.name, offset);
  }

  get_qualities(){ return [] }
}

class MissionTab extends StoreitemName {
  constructor(item, name, top, callback){
    super(name, callback, 
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT,
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP,
      "4%", "" + top + "%" );
    this.item = item;
    this.name = name;
    this.offset = top;
  }

  setup(){
    let control = super.setup();
    control.color = "White";
    control.height = "6%";
    control.cornerRadius = 1;
    control.width = "40";
    control.text = name;
    return control;
  }

  update(parent){
    this.control.top = "" + (this.offset + parent.scroll_offset) + "%";
  }
}

