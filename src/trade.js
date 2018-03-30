import * as landing from "landing";
import * as menu from "menu";

const PRICE_FACTORS = {
  // TODO: Not in love with hardcoding this
  high: 1.5,
  med: 1,
  low: .5,
};

// Columns for displaying trade stuff
const LABEL_LEFT = "5%"; // Center-aligned
const QUANTITY_LEFT = "30%"; 
const FACTOR_LEFT = "20%";
const PRICE_LEFT = "25%";
const BUY_LEFT = "40%";
const SELL_LEFT = "50%";


export class TradeMenu extends landing.BaseLandingMenuView {
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
      this.spob.trade[commodity]
    ];
  }

  buy(item, amount){
    let money =  this.get_local_price(item) * amount;
    if(this.player_data.can_add_cargo(amount) &&
        this.player_data.can_spend_money(money)){
      this.player_data.money -= money;
      if (item in this.player_data.bulk_cargo){
        this.player_data.bulk_cargo[item] += amount;
      } else {
        this.player_data.bulk_cargo[item] = amount;
      }
      this.update_widgets();
    }
  }

  sell(item, amount){
    if(this.player_data.can_sell_cargo(item, amount)){
      this.player_data.money += this.get_local_price(item) * amount;
      this.player_data.bulk_cargo[item] -= amount;
      this.update_widgets();
    }
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
    Object.keys(this.spob.trade).forEach( (key )  => {
      if (key in this.trade_data){
        running_offset_total += 5;
        let offset = "" + running_offset_total + "%";
        widgets.push(
          new CommodityLabel(this.trade_data[key].name, "15%", LABEL_LEFT, offset)
        );
        widgets.push(
          new QuantityLabel(key, offset)
        );
        widgets.push(
          new CommodityLabel(this.spob.trade[key], "5%", FACTOR_LEFT, offset)
        );
        widgets.push(
          new CommodityLabel("" + this.get_local_price(key),"5%", PRICE_LEFT, offset)
        );
        widgets.push(
          new CargoButton("buy", BUY_LEFT, offset, () => {
              this.buy(key, 1);
            }
          )
        );
        widgets.push(
          new CargoButton("sell", SELL_LEFT, offset, () => {
            this.sell(key, 1);
          })
        );
      } else {
        console.log("Invalid trade good: " + key);
      }
    });

    widgets.push(new CargoIndicator());
    widgets.push(new MoneyIndicator());

    return widgets;
  }
};

class CommodityLabel extends menu.TextBox{
  constructor(name, width, left, top){
    super(name, 
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT,
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP,
      left, top);

    this.width = width;

  }

  setup(){
    let control = super.setup();
    control.color = "White";
    control.width = this.width;
    control.height = "10%";
    return control;
  }
};

class QuantityLabel extends menu.TextBox {
  constructor(comodity, top){
    super(" ", 
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT,
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP,
        QUANTITY_LEFT, top
    );
    this.comodity = comodity;
  }

  setup(){
    let control = super.setup();
    control.color = "White";
    control.width = "10%";
    control.height = "10%";
    return control;
  }
  
  update( parent ){
    this.control.text = "" + parent.player_data.bulk_cargo_of_type(
        this.comodity
    );
  }

}
class CargoButton extends menu.TextButton {
  constructor(text, left, top, callback) {
    super(text, callback,
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT,
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_TOP,
        left, top);
  }

  setup(){
    let control = super.setup();
    control.alig
    control.color = "White";
    control.background = "red";
    control.height = "7%";
    control.width = "6%";
    control.cornerRadius = 3;
    control.paddingTop = "3%";
    return control;
  }
}
class CargoIndicator extends menu.TextBox {
  constructor(){
    super(" ", 
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT,
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP,
        "0%", "0%",)
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
      + parent.player_data.total_cargo()
      + "/" + parent.player_data.max_cargo() + " Kg"; 
  }
};

class MoneyIndicator extends menu.TextBox {
  constructor(){
    super(" ", 
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT,
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP,
        "30%", "0%",)
  }

  setup(){
    let control = super.setup();
    control.zOrder = -1;
    control.color = "White";
    control.width = "10%";
    control.height = "10%";
    return control;
  }

  update( parent ){
    this.control.text = "" + parent.player_data.money + " Coins";
  }
};
