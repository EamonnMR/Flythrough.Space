import {_} from "./singletons.js";
import { LandingMenuBigButton } from "./landing.js";
import { TextBox, Widget, BaseMenuView } from "./menu.js";


export class PlunderMenu extends BaseMenuView {
  enter(){
    this.setup_menu(this.get_widgets());
  }

  get_widgets(){
    let widgets = [];

    const LEFT = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    let ship = _.player.current_docked_ship;
    let cargo_type = Object.keys(ship.cargo_carried)[0];
    let cargo_amount = ship.cargo_carried[cargo_type];

    widgets.push(new LandingMenuBigButton(
      'Undock',
      () => {
        _.player.current_docked_ship = null;
        this.parent.enter_state('gameplay');
      },
      LEFT,
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
      "0%", "0%"
    ));

    if(ship.money){
      widgets.push(new LandingMenuBigButton(
        'Steal Credcoins',
        () => {
          _.hud.widgets.alert_box.show(`Stole ${_.player.current_docked_ship.money} Credcoin`);
          _.player.money += _.player.current_docked_ship.money;
          _.player.current_docked_ship.money = 0;
        },
        LEFT,
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
        "0%","-10%")
      );
    }

    if(cargo_amount){
      widgets.push(new LandingMenuBigButton(
        'Steal Cargo',
        () => {
          let cargo_stolen =_.player.fill_cargo(cargo_type, cargo_amount);
          if(cargo_stolen){
            _.hud.widgets.alert_box.show(`Stole ${cargo_stolen} tons of ${cargo_type}`);
          } else {
            _.hud.widgets.alert_box.show("Cargo full");
          }
          cargo_amount = 0;
          ship.cargo = {};
        },
        LEFT,
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
        "0%", "-20%")
      );
    }
    /*
    widgets.push(new LandingMenuBigButton(
      'Capture Ship',
      () => {
        // TODO: Enable capture 
      },
      RIGHT,
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
      "0%", "-30%")
    );
    */
    return widgets;
  }
};

