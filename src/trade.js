import * as landing from "landing";
import * as menu from "menu";

export class TradeMenu extends menu.BaseMenuView {
  constructor( spobs, player_data ){
    super();
    this.spobs = spobs;
    this.player_data = player_data;
  }
  enter(){
    this.spob = this.spobs[this.player_data.current_spob];
    this.setup_menu(this.get_trade_widgets());
  }

  get_trade_widgets(){
    return [
      new landing.LandingMenuBigButton(
        "Return",
        () => {
          this.parent.enter_state('landing');
        },
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT,
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
        "0%","0%"
      )
    ]
  }
}

