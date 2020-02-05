import { _ } from "./singletons.js";
import { LandingMenuBigButton } from "./landing.js";
import {
  BaseMenuView,
  simple_grid,
} from "./menu.js";

import {
  download_json,
  upload_json,
} from "./file_utils.js";

import {
  list_saves,
  restore,
  restore_from_object,
  strip_savefile_prefix,
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
          strip_savefile_prefix(key),
          () => {
            console.log("restoring:");
            console.log(key);
            _.player = restore(key);
            this.parent.enter_state('main');
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
    widgets.push( new LandingMenuBigButton(
      'Load From File',
      () => {
        upload_json( (json) => {
          _.player = restore_from_object(json);
          this.parent.enter_state('main');
        });
      },
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT,
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
      '50%',
      '0%',
    ));
    widgets.push( new LandingMenuBigButton(
      'Save To File',
      () => {
				download_json(_.player, _.player.name);	
      },
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT,
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
      '75%',
      '0%',
    ));

    return widgets;
 
  }
}

