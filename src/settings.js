/* Menu with a bunch of checkboxes which correspond to settings
 * saved in local storage. Can be overridden with query strings.
 * Not really a core feature so there's a fair amount of
 * copypasta and some hackery."
 * I have made this longer than usual because I have not had time to make it shorter.
 */

import { _ } from "./singletons.js";
import { DEFAULT_SETTINGS } from "./default_settings.js";
import {LandingMenuBigButton} from "./landing.js";
import {
  set_setting,
  clear_setting,
  get_setting,
  update_settings,
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
    // TODO: There's no excuse for this, it's just a nasty hack
    const INCR_H = 25;
    const INCR_V = 15;
    let top = -1 * INCR_V;
    let left = 15;
    let widgets = Object.keys( DEFAULT_SETTINGS ).map( (key) => {
      top += INCR_V;
      if( top >= 100 ){
        top = 0 - INCR_V;
        left += INCR_H;
      }
      return new BooleanSetting(key, "" + left + "%", "" + top + "%");
    });

    widgets.push( new LandingMenuBigButton(
      'Back',
      () => {
        this.parent.enter_state('main');
      },
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT,
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
      '0%',
      '0%',
    ));

    return widgets;
  }
  exit(){
    update_settings();
    super.exit();
  }
}

class BooleanSetting extends Widget{
  constructor(setting_name, left, top){
    super();
    this.left = left;
    this.top = top;
    this.setting = setting_name;
  }

  setup(){
    this.panel = new BABYLON.GUI.StackPanel();
    this.checkbox = new BABYLON.GUI.Checkbox();
    this.label = new BABYLON.GUI.TextBlock();

    this.panel.addControl(this.checkbox);
    this.panel.addControl(this.label);

    // See: https://www.babylonjs-playground.com/#U9AC0N#2
    this.panel.width = "25%";
    this.panel.height = "14%";
    this.panel.isVertical = false;
    this.panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    // TODO: Is this redundant? Are we calling setup_control elsewhere?
    this.panel.top = this.top;
    this.panel.left = this.left;

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
