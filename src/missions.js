import { choose } from "./util.js";

/* Missions, or: why implement a DSL when `eval` exists!
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

// Legal Cargos
// TODO: Generate this
let legal_cargo = ["water", "grain", "gas"]

function get_legal_cargo(){
  // This is where having a DB would be very nice.
  return choose(legal_cargo);
}

function get_random_spob_in_system(system){
  
}

export function missions_for_spob(){
  // TODO: Replace with actual avail system
  return {
    "test_mission":{
      "name": "Test Mission",
      "desc": "Test Description",
    }
  }
}
