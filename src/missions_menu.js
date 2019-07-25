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
      this.current_item().accept();
      // Refresh widgets to reflect new conditions
      this.hide_widgets();
      this.setup_widgets();
    }
  }

  can_purchase_item(mission){
    return mission.can_accept()
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

