
import { _ } from "./singletons.js";
import { choose, randint, multiInherit } from "./util.js";

/* Missions, or: why implement a DSL when `eval` exists!
 *
 * Key Terminology:
 * Offer: Showing the mission to the player, either as a modal or in the menu
 * Available: Player can accept the mission
 */

export function get_mission(name){
  // This uses a little StackOverflow magic to inherit from Mission
  // but also the mission data.
  //
  // The magic of text interpolation and random decision making
  // live in the bake() method of Mission.
  return multiInherit(new Mission(name), _.data.missions[name]);
}

class Mission{
  constructor(name){
    this.name = name;
  }

  bake(){
    // Order definitely matters here. Make sure anything that depends on another
    // value is evaluated first!
    if(this.dest){
      if(typeof this.dest === 'string'){
        // Support arbitrary functions as well as interpolated objects
        this.dest = this.interpolate_value(this.dest);
      } else {
        this.dest.sys = this.interpolate_text(this.dest.sys);
        this.dest.spob = this.interpolate_text(this.dest.spob);
      }
    }

    if(this.cargo){
      this.cargo.type = this.interpolate_text(this.cargo.type);
      this.cargo.amount = this.interpolate_value(this.cargo.amount);
    }

    if(this.target){
      this.target.type = this.interpolate_text(this.target.type);
      this.target.name = this.interpolate_text(this.target.name);
    }

    if(this.reward){
      this.reward = this.interpolate_value(this.reward);
    }

    this.desc = this.interpolate_text(this.desc);
    // TODO: Better field names
    this.short_name = this.interpolate_text(this.short_name);
  }

  interpolate_text(text){
    return eval('`' + text + '`');  // Interpolate with ${}.
  }

  interpolate_value(value){
    return eval(value);
  }

  run_trigger(field){
    eval(field);
  }

  can_accept(){
    /*
     * Handles if a mission being shown should be accepted.
     * Does the player have enough cargo? Also an arbitrary 'accept_id' field.
     */

    // Special case handling for cargo space availability because this
    // is expected to be a very common case.
    if(this.cargo && !_.player.can_add_cargo(this.cargo.amount)){
      return false;
    }
    
    if (this.accept_if){
      return this.interpolate_value(this.accept_if);
    }

    return true;
  }

  can_offer(){
    /*
     * Handles the 'offer_if' field. Decides if a mission should be visible.
     */
    if(this.name in _.player.active_missions){
      return false;
    }
    if('offer_if' in this){
      return this.interpolate_value(this.offer_if);
    }
  }
  
  accept(){
    _.player.active_missions[this.name] = this;
    if( 'cargo' in this ){
      _.player.add_mission_cargo(this.cargo.type, this.cargo.amount);
    }
  }

  success(mission){
    if( "reward" in this){
      _.player.money += this.reward;
    }
    this.resolve();
  }

  failure(mission){
    // TODO: Run penalty, etc
    this.resolve();
  }

  resolve(mission){
    delete _.player.active_missions[this.name];
    // TODO: Different pickup/dropoff times, etc
    if( cargo in this ){
      _.player.remove_mission_cargo(this.cargo.type, this.cargo.amount);
    }
  }
}



// Legal Cargos
// TODO: Generate this
let legal_cargo = ["water", "grain", "gas"]

function get_legal_cargo(){
  // This is where having a DB would be very nice.
  return choose(legal_cargo);
}

function get_random_spob_in_system(system){
  return choose(_.data.systems[system].spobs);
}

function select_spob_same_govt(){
  // TODO: Actually do this
  return {
    sys: "Casamance",
    spob: "Wajir",
  }
}

export function missions_for_state(state){
  let available = {};
  let missions = {basic_cargo: _.data.missions["basic_cargo"]};
  for( let key of Object.keys( missions )){  // _.data.missions )){
    let mission = get_mission(key);
    // TODO: Cache this
    if(mission.offer_state === state && mission.can_offer()){
      mission.bake();
      available[key] = mission;
    }
  }
  return available;
}

