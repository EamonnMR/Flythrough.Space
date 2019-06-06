/* Player State - this is what's shared between game states, and also handles saving and loading */

import {
  apply_upgrade,
  apply_upgrades,
  is_cheat_enabled,
  overridable_default,
} from "./util.js";

const PREFIX = "savefile_"  // Prefix for player saves in local storage.
const LAST_SAVE = "last_save"  // Stores the key for the last used save file

export function load_save(save_name){
  return JSON.parse(localStorage.getItem( key ));
}

export function load_saves(){
  return Object.keys( localStorage ).filter( (key) => key.startsWith(PREFIX)).map( load_save )
}

export function resume(){
  return load_save( localStorage.getItem( LAST_SAVE ));
}

export class PlayerSave {

  save(){
    let key = PREFIX + this.name;
    localStorage.setItem( key, JSON.stringify( this ) );
    localStorage.setItem( LAST_SAVE, key );
  }

  constructor(ships, upgrades) {
    this.name = "Joe Bloggs"
    this.money = is_cheat_enabled("money") ? 100000000 : 5000;
    this.map_pos = {x: 0, y: 0};
    this.selected_system = "Casamance";
    this.selected_spob = null;
    this.current_system = overridable_default("system", "Casamance");
    this.current_spob = overridable_default("spob", "Alluvium Fleet Yards");
    this.initial_position = {x: 0, y: 0};
    this.ship_type = overridable_default("ship", "shuttle");
    this.ship_dat = Object.create(ships[this.ship_type]);
    this.upgrades = this.ship_dat.upgrades;
    this.fuel = this.ship_dat.max_fuel;
    this.bulk_cargo = {};
    this.mission_cargo = {};

    this.govts = {
      // TODO: Default rep?
      orasos: {reputation: -1}
    }
    this.explored = []
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
  
  explore_system(system_name){
    console.log("System explored!");
    if(!this.explored.includes(system_name)){
      this.explored.push(system_name);
    }
    console.log(this.explored);
  }

  system_explored(system_name){
    return system_name in this.explored;
  }

  // TODO: Clean this up. All govts should be initialized with a default
  // reputation level as defined in data/govts.json
  is_govt_hostile(govt_id){
    return govt_id in this.govts && this.govts[govt_id].reputation < 0;
  }

  change_govt_reputation(govt_id, delta){
    if(govt_id in this.govts){
      this.govts[govt_id].reputation += delta;
    } else {
      this.govts[govt_id].reputation = delta;
    }
  }
}

