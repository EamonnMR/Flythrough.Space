import * as landing from "landing";

export class ShipyardMenu extends landing.BaseLandingMenuView {
  constructor(spobs, player_data, ships, upgrades){
    super();
    this.spobs = spobs;
    this.player_data = player_data;
    this.ships = ships;
    this.upgrades = upgrades;
    this.selected_ship = null;
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
    let offset = 10;
    let widgets = [];
    Object.keys(this.get_available_ships).forEach((key) => {
      running_offset += LIST_SPACING;
      ship_widgets.push(
        new ShipTab(key, this.ships[key].price, offset, () =>
          {this.select_ship(key);}
        )
      )
    });
    return widgets;
  }

  get_available_ships(){
    // TODO: Filter ships by tech and tech of spob
    return this.ships;
  }
}
