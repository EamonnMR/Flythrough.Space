import { BaseLandingMenuView } from "./landing.js";
import { TextButton } from "./menu.js";

const LIST_SPACING = 8;

export class ShipyardMenu extends BaseLandingMenuView {
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
    /*
    Object.keys(this.get_available_ships()).forEach((key) => {
      offset += LIST_SPACING;
      console.log(this.ships[key].short_name);
      console.log(this.ships[key].price);
      console.log("" + offset + "%");

      //widgets.push(
      //  new ShipTab(this.ships[key].short_name, this.ships[key].price, "" + offset + "10", () =>
      //    {this.select_ship(key);}
      //  )
      //);
    });
    */
    return widgets;
  }
  get_available_ships(){
    // TODO: Filter ships by tech and tech of spob
    return this.ships;
  }

  select_ship(ship){
   this.selected_ship = ship;
   this.update_widgets();
  } 
}
/*
class ShipTab extends TextButton {
  constructor(name, price, top, callback){
    super(name + price, callback,
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT,
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP,
        "5%", top);
  }
  setup(){
    let control = super.setup();
    control.color = "White";
    control.height = "12%";
    control.cornetRadius = 1;
    return control;
  }
};
*/
