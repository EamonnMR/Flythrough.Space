import { _ } from "./singletons.js";
import { choose } from "./util.js";

/* Missions, or: why implement a DSL when `eval` exists!
 *
 * Key Terminology:
 * Offer: Showing the mission to the player, either as a modal or in the menu
 * Available: Player can accept the mission
 */

export function bake_mission(mission){
  // Order definitely matters here. Make sure anything that depends on another
  // value is evaluated first!
  mission = Object.create(mission);
  if(mission.dest){
    if(typeof mission.dest === 'string'){
      // Support arbitrary functions as well as interpolated objects
      mission.dest = interpolate_mission_value(mission, mission.dest);
    } else {
      mission.dest.sys = interpolate_mission_text(mission, mission.dest.sys);
      mission.dest.spob = interpolate_mission_text(mission, mission.dest.spob);
    }
  }

  if(mission.cargo){
    mission.cargo.type = interpolate_mission_text(mission, mission.cargo.type);
    mission.cargo.amount = interpolate_mission_value(mission, mission.cargo.amount);
  }

  if(mission.target){
    mission.target.type = interpolate_mission_text(mission, mission.target.type);
    mission.target.name = interpolate_mission_text(mission, mission.target.name);
  }

  if(mission.reward){
    mission.reward = interpolate_mission_value(mission, mission.reward);
  }

  mission.desc = interpolate_mission_text(mission, mission.desc);
  mission.name = interpolate_mission_text(mission, mission.name);
  mission.short_name = mission.name;

}

function interpolate_mission_text(mission, text){
  for(let x in mission){ // Dump mission into scope
    eval(`let ${x} = ${mission[x]}`);
  }
  return eval('`' + text + '`');
}

function interpolate_mission_value(mission, value){
  for(let x in mission){ // Sadly, this needs to be copypasta
    eval `let ${x} = ${mission[x]}`;
  }
  return eval(value);
}

function run_mission_trigger(mission, field){
  for(let x in mission){ // Sadly, this needs to be copypasta
    eval `let ${x} = ${mission[x]}`;
  }
  eval(field);
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

export function can_accept_mission(mission){
  // Special case handling for cargo space availability because this
  // is expected to be a very common case.
  if(mission.cargo && !_.player.can_add_cargo(mission.cargo.amount)){
    return false;
  }
  
  if (mission.avail_if){
    return interpolate_mission_value(mission, mission.avail_if);
  }
}

export function accept_mission(mission){
  _.player.active_missions[mission.id] = mission;
  if( 'cargo' in mission ){
    _.player.add_mission_cargo(mission.cargo.type, mission.cargo.amount);
  }
}

export function mission_success(mission){
  if( "reward" in mission){
    _.player.money += mission.reward;
  }
  resolve_mission(mission);
}

export function mission_failure(mission){
  resolve_mission(mission);
}

export function resolve_mission(mission){
  delete _.player.active_missions[mission.id];
  if( cargo in mission ){
    _.player.remove_mission_cargo(mission.cargo.type, mission.cargo.amount);
  }
}

export function missions_for_state(state){
  let available = {};
  let missions = {basic_cargo: _.data.missions["basic_cargo"]};
  for( let key in Object.keys( missions )){  // _.data.missions )){
    debugger;
    let mission = _.data.missions[key];
    // TODO: Cache this
    if(mission.offer_state === state){
      if( ! mission.offer_if || interpolate_mission_value(mission, mission.offer_if) ){
        available[key] = bake_mission(mission);
      }
    }
  }
  return available;
  // TODO: Missions should note which state they offer during, in addition
  // to availability criteria.
}

