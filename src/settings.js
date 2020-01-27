/* Menu with a bunch of checkboxes which correspond to settings
 * saved in local storage. Can be overridden with query strings.
 * Not really a core feature so there's a fair amount of
 * copypasta and some hackery."
 * I have made this longer than usual because I have not had time to make it shorter.
 */

import { _ } from "./singletons.js";
import { simple_grid } from "./menu.js";
import { DEFAULT_SETTINGS } from "./default_settings.js";
import {LandingMenuBigButton} from "./landing.js";
import {
  set_setting,
  clear_setting,
  get_setting,
  update_settings,
  restore_default_settings,
} from "./util.js";

import {
  BaseMenuView,
  Widget
} from "./menu.js";

import { graphics_init } from "./graphics.js";


export class SettingsMenu extends BaseMenuView {
  enter(){
    super.enter();
    this.setup_menu(this.get_widgets());
  }

  //setup_menu(widgets){
  //  super.setup_menu(widgets);
  //}

  get_widgets(){
    let widgets = simple_grid(
      (key, left, top) => {
        return new BooleanSetting(key, left, top)
      },
      Object.keys(DEFAULT_SETTINGS)
    )

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
    widgets.push( new LandingMenuBigButton(
      'Reset',
      () => {
        restore_default_settings();
        this.update_widgets();
      },
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT,
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
      '0%',
      '0%',
    ));


    return widgets;
  }
  exit(){
    update_settings();
    graphics_init();
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

  update(){
    this.checkbox.isChecked = get_setting(this.setting);
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

    this.update();

    this.checkbox.width = "20px";
    this.checkbox.height = "20px";
    this.checkbox.color = "red";
    this.checkbox.onIsCheckedChangedObservable.add((value) => {
      if (value) {
        set_setting(this.setting, true);
      } else {
        clear_setting(this.setting);
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
