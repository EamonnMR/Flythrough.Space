import { weapon_factory } from "./weapon.js";
import { _ } from "./singletons.js";
import { DEFAULT_SETTINGS } from "./default_settings.js";

/* Use a library, or you'll end up cobbling together your own.
 */

const ARC = Math.PI * 2;
const SETTING_PREFIX = "_setting:";
export const CARRIED_PREFIX = "__carried_";

let url_params = new URLSearchParams(window.location.search);

let all_cheats_enabled = url_params.has("all_cheats");


export function distance(l_pos, r_pos){
  return Math.sqrt(
      Math.pow(l_pos.x - r_pos.x, 2) +
      Math.pow(l_pos.y - r_pos.y, 2)
  );
};

export function rect_from_polar(angle, magnitude){
  return {
    x: Math.cos(angle) * magnitude,
    y: Math.sin(angle) * magnitude,
  };
}

export function point_directly_at(to, from){
  /*
   * Calculate the turn (always clockwise) to point at a target
   */
  let dx = to.x - from.x;
  let dy = to.y - from.y;

  return Math.atan2(dy, dx) - Math.PI;
}

export function closest(middle_thing, other_things){
  let min_distance = Number.POSITIVE_INFINITY;
  let choice = null;
  for( let other of other_things){
    let dist = distance(middle_thing.position, other.position);
    if(min_distance > dist){
      min_distance = dist;
      choice = other;
    }
  }
  return choice;
}

export function get_direction(vector){
  return Math.atan2(vector.y, vector.x);
}

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

export function random_position(max_dist=200){
  // Pick a regular old position in a system.
  let distance = Math.random() * max_dist;
  let angle = Math.random() * 2 * Math.PI;
  return rect_from_polar(angle, distance);

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


export function randint(min, max){
  return min + Math.floor(Math.random() * ((max + 1) - min));
}

export function choose(choices){
  // Make a random choice between items in a list
  return choices[randint(0, choices.length - 1)];
}
export function is_cheat_enabled(cheat, is_global_cheat=true){
  return (all_cheats_enabled && is_global_cheat) || url_params.has(cheat);
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

export function filter(object, predicate){
  // https://stackoverflow.com/a/5072145/1048464
  let result = {};

  for (let key of Object.keys(object)) {
    if (/*object.hasOwnProperty(key) && */predicate(object[key])) {
      result[key] = object[key];
    }
  }

  return result;
}

function setting_key(key){
  return SETTING_PREFIX + key;
}

export function set_setting(key, value){
  window.localStorage.setItem(setting_key(key), value);
}

export function clear_setting(key){
  set_setting(key, ""); // We want it falsey
}

export function get_setting(key, optional_default=null){
  // TODO: yes, this is ORing them. So yes, this is kinda broken.
  return url_params.get(key) || window.localStorage.getItem(setting_key(key)) || optional_default;
}

export function assert_true(value, desc){
  if (!value){
    console.log(`TEST FAILURE: ${desc}`);
    console.log(`Expected true, got ${value}`);
  }
}

export function assert_false(value, desc){
  if (value){
    console.log(`TEST FAILURE: ${desc}`);
    console.log(`Expected false, got ${value}`);
  }
}

export function assert_equal(lval, rval, desc){
  if(!(JSON.stringify(lval) === JSON.stringify(rval))){
    console.log(`Test Failure: ${desc}`);
    console.log(`Expected`);
    console.log(lval);
    console.log(`To equal`);
    console.log(rval);
  }
}

export function update_settings(){
  Object.keys(DEFAULT_SETTINGS).forEach( (key) => {
    _.settings[key] = get_setting(key, DEFAULT_SETTINGS[key]);
  })
}

export function restore_default_settings(){
  console.log("restore_default_settings");
  Object.keys(DEFAULT_SETTINGS).forEach( (key) => {
    set_setting(key, DEFAULT_SETTINGS[key]);
  })
}

export function utils_unit_tests(){
  // Test local storage for settings
  set_setting("foo", "bar");
  assert_true(get_setting("foo", "baz") === "bar",
    "Can save settings in local storage");
  clear_setting("foo");
  assert_true(get_setting("foo", "baz") === "baz",
    "Can clear settings and get default values"
  );
}

