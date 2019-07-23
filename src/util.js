import { weapon_factory } from "./weapon.js";
import { _ } from "./singletons.js";

const ARC = Math.PI * 2;

export function distance(l_pos, r_pos){
  return Math.sqrt(
      Math.pow(l_pos.x - r_pos.x, 2) +
      Math.pow(l_pos.y - r_pos.y, 2)
  );
};

export function apply_upgrade(ship, upgrade){
  for(let key of Object.keys(upgrade)){
    if(key === "weapon"){
      let weapon = upgrade.weapon;
      ship.weapons.push( weapon_factory(weapon, _.data));
    } else if (key === "price" || key === "tech" || key === "desc" || key === "name"){
      // TODO: Should ships auto-include the price of upgrades?
      // Would that make life easier or harder?
      continue;
    } else {
      let value = upgrade[key];
      let type = typeof(value);
      if(type === "number"){
        // Numbers modify the ship's default values
        ship[key] = ship[key] + value;
      } else if (type === "boolean" || type == "string"){
        // We can't be too clever with string values, so just set these.
        ship[key] = value;
      } else {
        console.log("Unsupported type " + type + " in key " + key + " of an upgrade");
      }
    }
  }
}

export function apply_upgrades(ship, upgrades){
  ship.weapons = [];
  for(let key of Object.keys(upgrades)){
    for(let i = 0; i < upgrades[key]; i++){
      let upgrade = _.data.upgrades[key];
      if(upgrade === undefined){
        console.log("Invalid Upgrade: " + key);
      } else {
        apply_upgrade(ship, _.data.upgrades[key]);
      }
    }
  }
}

export function get_text(){
  // This defines the global text style for the project
  let text = new BABYLON.GUI.TextBlock();
  text.color = "White";
  text.text = "";
  text.fontFamily = "Sans";
  return text;
}

export function random_position(){
  // Pick a regular old position in a system.
  const MAX_DIST = 200;
  let distance = Math.random() * MAX_DIST;
  let angle = Math.random() * 2 * Math.PI;

  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
  };
};

export function angle_mod(angle){
  // Periodify angles and ensure they're always >= 0
  //           /         
  // 360      /           / / /
  //         /             / / /
  //   0---------- ===> ------------
  //       /
  //-360  /
  //     /
  //
  return (angle + ARC) % ARC;
}

export function in_firing_arc(angle, centerline, width){
  // https://stackoverflow.com/a/29721295/1048464
  let half_width = width / 2;
  let max = angle_mod(centerline - half_width);
  let min = angle_mod(centerline + half_width);
  // TODO Cache min and max per-turret
  if(max > min){
    return min < angle && angle < max;
  } else {
    return min < angle || angle < max;
  }
}

export function to_radians(deg){
  return Math.PI * (deg / 180);
}

export function tech_filter(tech_had, tech_needed){
  /* Basis for what gets shown where. I'm a bit foggy on how
   * I'd like to implement tech 'levels' at the moment, esp. since
   * I envision a few hub worlds where each major faction's tech
   * is available.
   */
  
  // Cleverly handles both empty tech_needed and tech_had
  for (let key of Object.keys(tech_needed || [])){
    if(!(key in (tech_had || {}))){
      return false;
    } else {
      if(tech_had[key] < tech_needed[key]){
        return false;
      }
    }
  }
  return true;
}

export function randint(min, max){
  return min + Math.floor(Math.random() * ((max + 1) - min));
}

export function choose(choices){
  // Make a random choice between items in a list
  return choices[randint(0, choices.length - 1)];
}

let url_params = new URLSearchParams(window.location.search);

let all_cheats_enabled = url_params.has("all_cheats");

export function is_cheat_enabled(cheat){
  return all_cheats_enabled || url_params.has(cheat);
}

export function overridable_default(key, default_value){
  return url_params.get(key) || default_value;
}

// huge stackoverflow copypasta for multiple inheritance
// https://stackoverflow.com/a/31236132/1048464

function getDesc (obj, prop) {
  var desc = Object.getOwnPropertyDescriptor(obj, prop);
  return desc || (obj=Object.getPrototypeOf(obj) ? getDesc(obj, prop) : void 0);
}

export function multiInherit (...protos) {
  return Object.create(new Proxy(Object.create(null), {
    has: (target, prop) => protos.some(obj => prop in obj),
    get (target, prop, receiver) {
            var obj = protos.find(obj => prop in obj);
            return obj ? Reflect.get(obj, prop, receiver) : void 0;
          },
    set (target, prop, value, receiver) {
            var obj = protos.find(obj => prop in obj);
            return Reflect.set(obj || Object.create(null), prop, value, receiver);
          },
    *enumerate (target) { yield* this.ownKeys(target); },
    ownKeys(target) {
            var hash = Object.create(null);
            for(var obj of protos) for(var p in obj) if(!hash[p]) hash[p] = true;
            return Object.getOwnPropertyNames(hash);
          },
    getOwnPropertyDescriptor(target, prop) {
            var obj = protos.find(obj => prop in obj);
            var desc = obj ? getDesc(obj, prop) : void 0;
            if(desc) desc.configurable = true;
            return desc;
          },
    preventExtensions: (target) => false,
    defineProperty: (target, prop, desc) => false,
  }));
}
