import * as landing from "landing";
import * as menu from "menu";

const PRICE_FACTORS = {
  // TODO: Not in love with hardcoding this
  high: 1.5,
  med: 1,
  low: .5,
};

export class TradeMenu extends menu.BaseMenuView {
  constructor( spobs, player_data, trade_data ){
    super();
    this.spobs = spobs;
    this.player_data = player_data;
    this.trade_data = trade_data;
  }
  enter(){
    this.spob = this.spobs[this.player_data.current_spob];
    this.trade_widgets = this.get_trade_widgets();
    this.setup_menu(this.get_misc_widgets().concat(this.trade_widgets));
  }

  get_local_price(commodity){
    return this.trade_data[commodity].price * PRICE_FACTORS[
      this.spob.trade[comodity]
    ];
  }

  buy(comodity, amount){
    this.player_data.money -= this.get_local_price(commodity) * amount;
    this.player_data.bulk_cargo[comodity] += amount;
    // TODO: Handle undefined case
    // todo; enforce bounds
    this.update_widgets();
  }

  sell(comodity, amount){
    // TODO
  }

  get_misc_widgets(){
    return  [
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
  get_trade_widgets(){ 
    let widgets = []
    let running_offset_total = 0;
 /*   Object.keys(this.spob.trade).forEach( (key )  => {
      widgets.push(
        new CommodityLabel();
      );
      widgets.push(
        new BuyButton();
      );
      widgets.push(
        new SellButton();
      );
      widgets.push(
        new CargoIndicator();
      );
    });
*/
    widgets.push(new CargoIndicator(this.player_data));

    return widgets;
  }
};

/*
class CommodityLabel extends menu.TextBox{
};

// These should register the components with the parent (menu)
// object when they are created so that the parent has a pointer
// back to them and can update the clickability.
//
// Maybe just do that through these classes? I'm sort of undecided

class BuyButton extends menu.Button{
};

class SellButton extends menu.Button{
};
*/

class CargoIndicator extends menu.TextBox{
  constructor(player){
    super("Hello!", 
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT,
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP,
        "0%", "0%",)
    this.player = player;
  }

  setup(){
    let control = super.setup();
    control.zOrder = -1;
    control.color = "White";
    control.width = "20%";
    control.height = "10%";
    return control;
  }

  update( parent ){
    this.control.text = "Cargo Space "
      + this.player.total_cargo()
      + "/" + this.player.max_cargo() + " Kg"; 
  }
};
