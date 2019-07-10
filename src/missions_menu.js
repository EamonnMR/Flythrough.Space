import {StoreMenu, StoreitemName, storeitemDesc, BuyButton} from "./store.js";

import { TextButton, TextBox } from "./menu.js";

import { missions_for_spob } from "./missions.js";


export class MissionsMenu extends StoreMenu {

  constructor(spobs, player_data, items, data){
    this.spobs = spobs;
    this.player_data = player_data;
    this.raw_items = items;
    this.data = data;
  }

  get_available_items(){
    return missions_for_spob(data, this.player_data.current_spob);
  }
    
  do_buy(){
    if (this.player_data.can_accept_mission(this.current_item())){
      this.player_data.accept_mission(this.current_item());
    }
  }

  can_purchase_item(item){
    return this.player_data.can_accept_mission(this.current_item());
  }

  can_sell_item(item){
    return false;
  }

  get_selection_tab_widget(key, item, offset){
    return new MissionTab(item, item.r_name, offset);
  }

  get_qualities(){ return [] }
}
