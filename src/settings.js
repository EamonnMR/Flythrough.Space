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
    super.enter();
    this.setup_menu(this.get_widgets());
  }

  //setup_menu(widgets){
  //  super.setup_menu(widgets);
  //}

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

  get_control(){
    this.panel = new BABYLON.GUI.StackPanel();
    this.checkbox = new BABYLON.GUI.Checkbox();
    this.label = new BABYLON.GUI.TextBlock();

    this.panel.addControl(this.checkbox);
    this.panel.addControl(this.label);

    // See: https://www.babylonjs-playground.com/#U9AC0N#2
    this.panel.width = "200px";
    this.panel.isVertical = false;
    this.panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;

    this.checkbox.isChecked = get_setting(this.setting)
    this.checkbox.width = "20px";
    this.checkbox.height = "20px";
    this.checkbox.color = "red";
    this.checkbox.onIsCheckedChangedObservable.add((value) => {
      if (value) {
        clear_setting(this.setting);
      } else {
        set_setting(this.setting, true);
      }
    });

    this.label.text = this.setting;
    this.label.width = "180px";
    this.label.marginLeft = "5px";
    this.label.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.label.color = "white";
    return this.panel;
  }
}
