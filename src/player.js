/* Player State - this is what's shared between game states, and also handles saving and loading */

import { _ } from "./singletons.js";

import {
  apply_upgrade,
  apply_upgrades,
  is_cheat_enabled,
  overridable_default,
  choose,
} from "./util.js";

const PREFIX = "savefile_"  // Prefix for player saves in local storage.
const LAST_SAVE = "last_save"  // Stores the key for the last used save file

const ZOOM_MAX = 10;
const KILL_PENALTY = -100;

export function load_save(save_name){
  return JSON.parse(localStorage.getItem( save_name ));
}

export function strip_savefile_prefix(savefile_name){
  return savefile_name.replace(PREFIX, "");
}

export function list_saves(){
  return Object.keys( localStorage ).filter( (key) => { return key && key.startsWith(PREFIX)})
}

// export function resume(){
//   return _.player = load_save( localStorage.getItem( LAST_SAVE ));
//}

export function restore(key){
  console.log(`Restore from local storage: ${key}`);
  return restore_from_object(load_save(key));
}

export function restore_from_object(object){
  let player = Object.assign(
    new PlayerSave(),
    object,
  );

  player.ship_dat = Object.create(_.data.ships[player.ship_type]);
  player.ship_dat.upgrades = player.upgrades;

  return player;
}

export class PlayerSave {

  save(){
    let key = PREFIX + this.name;
    localStorage.setItem( key, JSON.stringify( this ) );
    localStorage.setItem( LAST_SAVE, key );
  }

  constructor() {
    this.name = choose([
      "Drew Jason",
      "Elinore",
      "Brumpo Tungus",
      "Synthia Drangles",
      "Joe Bloggs",
    ]);
    this.money = is_cheat_enabled("money") ? 100000000 : 5000;
    this.map_pos = {x: 0, y: 0};
    this.selected_system = "Casamance";
    this.selected_spob = null;
    this.current_system = overridable_default("system", "Casamance");
    this.current_spob = overridable_default("spob", "Alluvium Fleet Yards");
    this.current_docked_ship = null;
    this.initial_position = {x: 0, y: 0};
    this.ship_type = overridable_default("ship", "shuttle");
    this.ship_skin = null // "pirate";  // TODO: Add skin menu
    this.ship_dat = Object.create(_.data.ships[this.ship_type]);
    this.upgrades = this.ship_dat.upgrades;
    this.fuel = this.ship_dat.max_fuel;
    this.bulk_cargo = {};
    this.mission_cargo = {};
    this.active_missions = {};
    this.fleet = [];
    this.total_accumulated_damage;

    this.govts = this.init_govts();
    this.explored = []
    this.zoom = 4 // Player's zoom level
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
    return this.free_cargo() >= amount;
  }

  free_cargo(){
    return this.max_cargo() - this.total_cargo();
  }

  fill_cargo(type, max_amount){
    let amount = Math.max(max_amount, this.free_cargo())
    if(amount){
      this.add_bulk_cargo(type, amount);
    }
    return amount;
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

  add_mission_cargo(type, amount){
    if (type in this.mission_cargo) {
      this.mission_cargo[type] += amount;
    } else {
      this.mission_cargo[type] = amount;
    }
  }

  add_bulk_cargo(type, amount){
    if (type in this.mission_cargo) {
      this.bulk_cargo[type] += amount;
    } else {
      this.bulk_cargo[type] = amount;
    }
  }

  remove_mission_cargo(type, amount){
    this.mission_cargo[type] -= amount;
    if(this.mission_cargo[type] === 0){
      delete this.mission_cargo[type];
    }
  }

  remove_bulk_cargo(type, amount){
    this.bulk_cargo[type] -= amount;
    if(this.bulk_cargo[type] === 0){
      delete this.bulk_cargo[type];
    }
  }



  buy_ship(type, new_ship){
    this.money += this.ship_value();
    this.ship_type = type;
    this.ship_dat = Object.create(new_ship);
    this.money -= new_ship.price;
    this.upgrades = this.ship_dat.upgrades;
  }

  can_buy_upgrade(price, upgrade, quantity){
    let ship_if_bought = Object.create(this.ship_dat);
    apply_upgrades(ship_if_bought, this.upgrades);
    
    for(let i = 0; i < quantity; i++){
      apply_upgrade(ship_if_bought, upgrade);
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
  }
  
  explore_system(system_name){
    if(!this.system_explored(system_name)){
      this.explored.push(system_name);
    }
  }

  system_explored(system_name){
    return this.explored.includes(system_name);
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

  zoom_in(){
    console.log("zoom in");
    console.log(this.zoom);
    this.zoom -= 1;
    if(this.zoom < 1){
      console.log("min zoom");
      this.zoom = 1;
    }
    console.log(this.zoom);
  }

  zoom_out(){
    console.log("zoom out");
    console.log(this.zoom);
    this.zoom += 1;
    if(this.zoom >= ZOOM_MAX){
      console.log(this.zoom);
      this.zoom = ZOOM_MAX;
    }
    console.log(this.zoom);
  }

  destroyed_ship_of_govt(govt){
    this.change_govt_reputation(govt, -1 * KILL_PENALTY);
  }

  init_govts(){
    let govts = {};
    for(let key of Object.keys(_.data.govts)){
      govts[key] = {
        reputation: _.data.govts[key].default_rep,
      }
    }
    return govts;
  }
}

