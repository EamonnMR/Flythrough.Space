import { _ } from "./singletons.js";
import { StoreMenu, StoreitemName, StoreitemDesc, BuyButton } from "./store.js";
import { TextButton, TextBox } from "./menu.js";
import { missions_for_state} from "./missions.js";

export class MissionsMenu extends StoreMenu {
  constructor(){
    super(null);
  }

  enter(){
    this.items = missions_for_state("missions");
    super.enter();
  }

  get_available_items(){
    return this.items;
  }
    
  do_buy(){
    if (this.current_item().can_accept()){
      _.player.accept_mission(this.current_item());
    }
  }

  can_purchase_item(item){
    this.items[item].can_accept()
  }

  can_sell_item(item){
    return false;
  }

  get_selection_tab_widget(key, item, offset){
    return new MissionTab(item, item.name, offset);
  }

  get_qualities(){ return [] }

  buy_button_copy(){
    return "accept";
  }
}

class MissionTab extends TextButton {
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
    control.width = "40%";
    control.text = name;
    return control;
  }

  update(parent){
    this.control.top = "" + (this.offset + parent.scroll_offset) + "%";
  }
}

