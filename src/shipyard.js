import * as landing from "landing";

export class ShipyardMenu extends landing.BaseLandingMenuView {
  constructor(spobs, player_data, ships, upgrades){
    super();
    this.spobs = spobs;
    this.player_data = player_data;
    this.ships = ships;
    this.upgrades = upgrades;
  }

  enter(){
    this.spob = this.spobs[this.player_data.current_spob];
    this.setup_menu(
      this.get_detail_widgets().concat(
        this.get_ship_list_widgets().concat(
            this.get_misc_widgets()
        )
      )
    );
  }

  get_detail_widgets(){
    return [];
  }

  get_ship_list_widgets(){
    return [];
  }

}
