import { _ } from "./singletons.js";
import { LandingMenuBigButton } from "./landing.js";
import {
  BaseMenuView,
  simple_grid,
} from "./menu.js";

import {
  list_saves,
  restore,
} from "./player.js";

export class SavesMenu extends BaseMenuView {
  enter(){
    super.enter();
    this.setup_menu(this.get_widgets());
  }
  get_widgets(){
    let widgets = simple_grid(
      (key, left, top) => {
        return new LandingMenuBigButton(
          key,
          () => {
            console.log("restoring:");
            console.log(key);
            restore(key);
          },
          BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT,
          BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP,
          left,
          top,
        );
      },
      list_saves()
    );
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
}



