import {_} from "./singletons.js";
import { LandingMenuBigButton } from "./landing.js";
import { TextBox, Widget, BaseMenuView } from "./menu.js";


export class PlunderMenu extends BaseMenuView {
  enter(){
    this.setup_menu(this.get_widgets());
  }

  get_widgets(){
    let widgets = [];

    /* LEFT WIDGETS */
    const LEFT = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    let ship = _.player.current_docked_ship;
    let cargo_type = Object.keys(ship.cargo)[0];
    let cargo_amount = ship.cargo[cargo_type];

    widgets.push(new TextBox(
      ` Boarded ${ship.short_name}
      Faction: ${_.data.govts[ship.govt].name}
      Capture Odds: 0%
      Carrying: ${cargo_amount} tons of ${cargo_type}
      Cash: ${ship.money} Credcoin
      `,
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT,
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP,
      "0%",
      "0%",
    ));


    widgets.push(new LandingMenuBigButton(
      'Undock',
      () => {
        _.player.current_docked_ship = null;
        this.parent.enter_state('gameplay');
      },
      LEFT,
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
      "0%", "0%")
    );

    if(ship.money){
      widgets.push(new LandingMenuBigButton(
        'Steal Credcoins',
        () => {
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
          _.player.fill_cargo(cargo_type, cargo_amount);
          cargo_amount = 0;
          ship.cargo = {};
        },
        RIGHT,
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

