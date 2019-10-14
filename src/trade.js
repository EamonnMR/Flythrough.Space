import { _ } from "./singletons.js";

import { BaseLandingMenuView } from "./landing.js";
import { TextBox, TextButton } from "./menu.js";

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


export class TradeMenu extends BaseLandingMenuView {
  enter(){
    this.spob = _.data.spobs[_.player.current_spob];
    this.trade_widgets = this.get_trade_widgets();
    this.setup_menu(this.get_misc_widgets().concat(this.trade_widgets));
  }

  get_local_price(commodity){
    return _.data.trade[commodity].price * PRICE_FACTORS[
      this.spob.trade[commodity]
    ];
  }

  buy(item, amount){
    let money =  this.get_local_price(item) * amount;
    if(_.player.can_add_cargo(amount) &&
        _.player.can_spend_money(money)){
      _.player.money -= money;
      if (item in _.player.bulk_cargo){
        _.player.bulk_cargo[item] += amount;
      } else {
        _.player.bulk_cargo[item] = amount;
      }
      this.update_widgets();
    }
  }

  sell(item, amount){
    if(_.player.can_sell_cargo(item, amount)){
      _.player.money += this.get_local_price(item) * amount;
      _.player.bulk_cargo[item] -= amount;
      this.update_widgets();
    }
  }
  get_trade_widgets(){ 
    let widgets = []
    let running_offset_total = 0;
    Object.keys(this.spob.trade).forEach( (key )  => {
      if (key in _.data.trade){
        running_offset_total += 5;
        let offset = "" + running_offset_total + "%";
        widgets.push(
          new CommodityLabel(_.data.trade[key].name, "15%", LABEL_LEFT, offset)
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

class CommodityLabel extends TextBox {
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

class QuantityLabel extends TextBox {
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
    this.control.text = "" + _.player.bulk_cargo_of_type(
        this.comodity
    );
  }

}
class CargoButton extends TextButton {
  constructor(text, left, top, callback) {
    super(text, callback,
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT,
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_TOP,
        left, top);
  }

  setup(){
    let control = super.setup();
    control.color = "White";
    control.background = "red";
    control.height = "7%";
    control.width = "6%";
    control.cornerRadius = 3;
    control.paddingTop = "3%";
    return control;
  }
}
class CargoIndicator extends TextBox {
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
      + _.player.total_cargo()
      + "/" + _.player.max_cargo() + " Kg"; 
  }
};

class MoneyIndicator extends TextBox {
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
    this.control.text = "" + _.player.money + " Coins";
  }
};

