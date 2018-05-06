import { BaseLandingMenuView } from "./landing.js";
import { TextButton } from "./menu.js";

const LIST_SPACING = 7;

export class ShipyardMenu extends BaseLandingMenuView {
  constructor(spobs, player_data, ships, upgrades){
    super();
    this.spobs = spobs;
    this.player_data = player_data;
    this.ships = ships;
    this.upgrades = upgrades;
    this.selected = null;
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
    let offset = 0;
    let widgets = [];
    Object.keys(this.get_available_ships()).forEach((key) => {
      offset += LIST_SPACING;

      widgets.push(
        new ShipTab(this.ships[key].short_name, this.ships[key].price, "" + offset + "%", () =>
          {this.select_ship(key);}
        )
      );
    });
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
class ShipTab extends TextButton {
  constructor(item, name, price, top, callback){
    this.item = item;
    this.name = name;
    this.price = price;
    super(this.format_name(null), callback,
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT,
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP,
        "4%", top);
  }
  setup(){
    let control = super.setup();
    control.color = "White";
    control.height = "6%";
    control.cornerRadius = 1;
    control.width = "40%";
    return control;
  }

  update(parent){
    this.control.text = 
  }

  format_name(parent){
    let too_expensive = null;
    let current_selection = null;
    if(parent !== null){
      too_expensive = player.can_buy_new_ship(this.price);
    }
    current_selection = parent.selection == this.item; 

    if current_selection
};

