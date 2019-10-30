import { _ } from "./singletons.js";
import {
  set_setting,
  clear_setting,
  get_setting
} from "./util.js";

import {
  BaseMenuView,
  Widget
} from "./menu.js";


export class SettingsMenu extends BaseMenuView {
  enter(){
    this.setup_menu(this.get_widgets());
  }

  get_widgets(){
    return [
      new BooleanSetting("starfield"),
      new BooleanSetting("parallax_starfield"),
      new BooleanSetting("light_effects"),
      new BooleanSetting("pervasive_particles"),
      new BooleanSetting("ai_leading"),
      new BooleanSetting("mobile_controls"),
    ]
  }
}

class BooleanSetting extends Widget{
  constructor(setting_name){
    super();
    this.setting = setting_name
  }

  setup(){
    return new BABYLON.GUI.Checkbox() 
  }

  setup_control(checkbox){
    checkbox.isChecked = get_setting(this.setting)
    checkbox.onIsCheckedChangedObservable.add( () => {
      console.log("toggle: " + setting_name);
      if(this.control.isChecked){
        clear_setting(this.setting);
      } else {
        set_setting(this.setting, true);
      }
    });
  }
}
