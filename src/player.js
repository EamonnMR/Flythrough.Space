/* Player State - this is what's shared between game states, and also handles saving and loading */

import { _ } from "./singletons.js";

import {
  apply_upgrade,
  apply_upgrades,
  is_cheat_enabled,
  overridable_default,
  choose,
  dict_add,
  dict_subtract,
  assert_true,
  assert_false,
  assert_equal,
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
  
  flagship = Object.assign(
    new ShipSave(player.flagship.type),
    object,
  )

  for(i = 0; i < player.fleet.length; i++){
    player.fleet[i] = Object.assign(
      new ShipSave(player.fleet[i].type),
      player.fleet[i],
    );
  }
  return player;
}

export class ShipSave {
  // Interchangeable player/escort ship data
  constructor(type){
    this.type = type;
    this.skin = null // TODO: Add skin menu
    this.dat = Object.create(_.data.ships[this.type]);
    this.upgrades = this.dat.upgrades;
    this.fuel = this.dat.max_fuel;
    this.bulk_cargo = {};
    this.mission_cargo = {};
  }

  can_buy_upgrade(price, upgrade, quantity){
    let ship_if_bought = Object.create(this.dat);
    apply_upgrades(ship_if_bought, this.upgrades);
    
    for(let i = 0; i < quantity; i++){
      apply_upgrade(ship_if_bought, upgrade);
    }
    return this.validate_ship( ship_if_bought ) && _.player.can_spend_money(upgrade.price * quantity);
  }

  buy_upgrade(type, quantity){
    dict_add(this.upgrades, type, quantity);

    this.dat.upgrades = this.upgrades;
    _.player.money -= _.data.upgrades[type].price * quantity;
  }

  sell_upgrade(type, quantity){
    dict_subtract(this.upgrades, type, quantity);

    this.dat.upgrades = this.upgrades;
    _.player.money += _.data.upgrades[type].price * quantity;
  }

  cargo_carried(){
    let total = 0;
    // TODO: Reduce
    [this.bulk_cargo, this.mission_cargo].forEach( (cargo_dict) =>{
      Object.keys(cargo_dict).forEach( (key) => {
        total += cargo_dict[key];
      })
    })
    return total;
  }

  validate_ship( ship ){
    return ship.space >= 0 && ship.cargo >= 0 && ship.cargo >= this.cargo_carried();
  }
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
    this.active_missions = {};
    this.flagship = new ShipSave(overridable_default("ship", "shuttle"));
    this.fleet = [];

    this.total_accumulated_damage = 0;

    this.govts = this.init_govts();
    this.explored = []
    this.zoom = 4 // Player's zoom level
  }

  total_cargo(){
    return this.all_ships().reduce(
      (accumulator, ship) => {
        return accumulator + ship.cargo_carried();
      },
      0,
    );
  }

  all_ships(){
    return this.fleet.concat([this.flagship])
  }

  bulk_cargo_of_type(type){
    return this.all_ships().reduce(
      (accumulator, ship) => {
        if(type in ship.bulk_cargo){
          return accumulator += ship.bulk_cargo[type];
        }
        return accumulator;
      },
      0,
    );
  }

  max_cargo(){
    return this.all_ships().reduce(
      (accumulator, ship) => accumulator + ship.dat.cargo,
      0,
    );
  }

  max_fuel(){
    return this.flagship.dat.max_fuel;
  }

  can_refuel(){
    return this.flagship.fuel < this.max_fuel();
  }

  can_add_cargo(amount){
    return this.free_cargo() >= amount;
  }

  free_cargo(){
    return this.max_cargo() - this.total_cargo();
  }

  fleet_bulk_cargo(){
    let fleet_bulk_cargo = {};
    this.all_ships().forEach( (ship) => {
      for( let key of Object.keys(ship.bulk_cargo)){
        dict_add(fleet_bulk_cargo, key, ship.bulk_cargo[key]);
      }
    });
    return fleet_bulk_cargo;
  }

  fill_cargo(type, max_amount){
    // console.log(`fill_cargo: ${max_amount} into ${this.free_cargo()}`);
    let amount = Math.min(max_amount, this.free_cargo())
    // console.log(`Decided to take ${amount}`);
    // console.log(this.fleet_bulk_cargo());
    if(amount){
      this.add_bulk_cargo(type, amount);
    }
    // console.log(this.bulk_cargo);
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
    return this.dat.price;
  }

  can_buy_new_ship(price){
    return price <= this.money + this.ship_value();
  }

  can_buy_new_ship_outright(price){
    return price <= this.money;
  }

  add_mission_cargo(type, amount){
    // TODO: Handle Fleets
    dict_add(this.flagship.mission_cargo, type, amount);
  }

  add_bulk_cargo(type, amount){
    // TODO: Handle Fleets
    dict_add(this.flagship.bulk_cargo, type, amount);
  }

  remove_mission_cargo(type, amount){
    // TODO: Handle Fleets
    dict_subtract(this.flagship.mission_cargo, type, amount);
  }

  remove_bulk_cargo(type, amount){
    // TODO: Handle Fleets
    dict_subtract(this.flagship.bulk_cargo, type, amount);
  }

  buy_ship(type, new_ship){  // TODO: rename buy_flagship
    this.money += this.ship_value("flagship");
    let new_flagship = ShipSave(type);
    this.money -= new_flagship.dat.price;
    // TODO: Transfer cargo
    this.flagship = new_flagship;
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
    // TODO: Could dict_add be bent to this use?
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

function test_fill_cargo(){
  let plr = new PlayerSave();
  plr.fill_cargo("metal", 11)

  assert_equal(
    plr.flagship.bulk_cargo,
    {metal: 10},
    "fill cargo fills bulk cargo",
  );
}

function test_fleet_bulk_cargo(){
  let plr = new PlayerSave();
  plr.fill_cargo("metal", 11)

  assert_equal(
    plr.fleet_bulk_cargo(),
    {metal: 10},
    "Fleet bulk cargo is calculated correctly",
  );
}

function test_total_cargo(){
  let plr = new PlayerSave();
  plr.fill_cargo("metal", 11)
  assert_equal(
    plr.total_cargo(),
    10,
    "Total Cargo is calculated correctly",
  );
}

function test_max_cargo(){
  let plr = new PlayerSave();
  assert_equal(
    plr.max_cargo(),
    10, // Capacity of default ship
    "max cargo is calculated correctly",
  );
}

function test_all_ships(){
  let plr = new PlayerSave();
  assert_equal(
    plr.all_ships(),
    [plr.flagship],
    "all_ships returns only the flagship",
  );
}

function test_add_bulk_cargo(){
  const AMT = 5;
  let plr = new PlayerSave();
  plr.add_bulk_cargo("metal", AMT);
  assert_equal(
    plr.total_cargo(),
    AMT,
    "can add_bulk_cargo",
  );
}


function test_add_mission_cargo(){
  const AMT = 5;
  let plr = new PlayerSave();
  plr.add_mission_cargo("metal", AMT);
  assert_equal(
    plr.total_cargo(),
    AMT,
    "can add mission cargo",
  );
}

function test_remove_bulk_cargo(){
  const AMT = 5;
  let plr = new PlayerSave();
  plr.add_bulk_cargo("metal", AMT);
  plr.remove_bulk_cargo("metal", AMT);
  assert_equal(
    plr.total_cargo(),
    0,
    "can remove_bulk_cargo",
  );
}


function test_remove_mission_cargo(){
  const AMT = 5;
  let plr = new PlayerSave();
  plr.add_mission_cargo("metal", AMT);
  plr.remove_mission_cargo("metal", AMT);
  assert_equal(
    plr.total_cargo(),
    0,
    "can remove_mission_cargo",
  );
}

export function player_unit_tests(){
  test_add_bulk_cargo();
  test_add_mission_cargo();
  test_remove_bulk_cargo();
  test_remove_mission_cargo();
  test_max_cargo();
  test_all_ships();
  test_fill_cargo();
  test_total_cargo();
  test_fleet_bulk_cargo();
}
