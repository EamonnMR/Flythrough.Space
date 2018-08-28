/* Player State - this is what's shared between game states. */

import { apply_upgrade, apply_upgrades } from "./util.js";

export class PlayerSave {
  constructor(ships, upgrades) {
    // TODO: Load this from some sort of backing store / DB / etc
    this.money = 100000000;
    this.map_pos = {x: 0, y: 0};
    this.selected_system = "Casamance";
    this.selected_spob = null;
    this.current_system = "Casamance";
    this.current_spob = "Alluvium Fleet Yards";
    this.initial_position = {x: 0, y: 0};
    this.ship_type = "shuttle";
    this.upgrades = {"plasma50": 1};
    this.fuel = 3; // They start out with a full tank of gas (for a shuttle)

    this.bulk_cargo = {};
    this.mission_cargo = {};

    this.govts = {
      // TODO: Default rep?
      orasos: {reputation: -1}
    }
    this.ship_dat = Object.create(ships[this.ship_type]);
    this.ship_dat.upgrades = this.upgrades;
  }

  total_cargo(){
    // Total cargo space used up on the player's ship
    let total = 0;
    [this.bulk_cargo, this.mission_cargo].forEach( (cargo_type) =>{
      Object.keys(cargo_type).forEach( (key) => {
        total += cargo_type[key];
      })
    });
    return total;
  }

  bulk_cargo_of_type(type){
    if(type in this.bulk_cargo){
      return this.bulk_cargo[type];
    } else {
      return 0;
    }
  }

  max_cargo(){
    return this.ship_dat.cargo;
  }

  max_fuel(){
    return this.ship_dat.max_fuel;
  }

  can_refuel(){
    return this.fuel < this.max_fuel();
  }

  can_add_cargo(amount){
    return this.max_cargo() >= this.total_cargo() + amount;
  }

  can_sell_cargo(type, amount){
    return this.bulk_cargo_of_type(type) >= amount;
  }
  
  can_spend_money(amount){
    return this.money >= amount;
  }

  refuel(){
    this.fuel = this.max_fuel();
  }

  ship_value(){
    return this.ship_dat.price;
  }

  can_buy_new_ship(price){
    return price <= this.money + this.ship_value();
  }

  buy_ship(type, new_ship){
    this.money += this.ship_value();
    this.ship_type = type;
    this.ship_dat = Object.create(new_ship);
    this.money -= new_ship.price;
    this.upgrades = this.ship_dat.upgrades;
  }

  can_buy_upgrade(price, upgrade, quantity, data){
    let ship_if_bought = Object.create(this.ship_dat);
    apply_upgrades(ship_if_bought, this.upgrades, data);
    
    for(let i = 0; i < quantity; i++){
      apply_upgrade(ship_if_bought, upgrade, data);
    }
    return this.can_spend_money(upgrade.price * quantity)
      && this.validate_ship( ship_if_bought );
  }
  
  validate_ship( ship ){
    return ship.space >= 0 && ship.cargo >= this.total_cargo();
  }

  buy_upgrade(type, upgrade, quantity){
    if(type in this.upgrades){
      this.upgrades[type] += quantity;
      if(this.upgrades[type] == 0){
        delete this.upgrades[type];
      }
    } else {
      this.upgrades[type] = quantity;
    }

    this.ship_dat.upgrades = this.upgrades;
    this.money -= upgrade.price * quantity;
    console.log(this);
  }
}
  

