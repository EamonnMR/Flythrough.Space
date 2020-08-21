import { weapon_factory } from "./weapon.js";
import { _ } from "./singletons.js";
import { DEFAULT_SETTINGS } from "./default_settings.js";

/* Use a library, or you'll end up cobbling together your own.
 */

export const ARC = Math.PI * 2;
const SETTING_PREFIX = "_setting:";
export const CARRIED_PREFIX = "__carried_";
export const RENDERING_GROUPS = 256;

let url_params = new URLSearchParams(window.location.search);

let all_cheats_enabled = url_params.has("all_cheats");


export function distance(l_pos, r_pos){
  return Math.sqrt(
      Math.pow(l_pos.x - r_pos.x, 2) +
      Math.pow(l_pos.y - r_pos.y, 2)
  );
};


export function polar_from_rect(coord){
  return {
    angle: angle_mod(Math.atan2(coord.y, coord.x) - Math.PI),
    magnitude: Math.sqrt( coord.y * coord.y + coord.x * coord.x),  }
}

export function vector_plus(lvec, rvec){
  return {
    x: lvec.x + rvec.x, 
    y: lvec.y + rvec.y,
  }
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
    } else if (key === "price" || key === "tech" || key === "desc" || key === "name" || key === "type"){
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
  dict_foreach(upgrades, ( type ) => {
    let upgrade = _.data.upgrades[type];
    if(upgrade === undefined){
      console.log("Invalid Upgrade: " + type);
    } else {
      apply_upgrade(ship, upgrade);
    }
  });
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


export function rect_from_polar(angle, magnitude){
  angle = angle_mod(angle);
  return {
    x: Math.cos(angle) * magnitude,
    y: Math.sin(angle) * magnitude,
  };
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

export function get_setting(key){
  // TODO: yes, this is ORing them. So yes, this is kinda broken.
  
  return url_params.get(key) || window.localStorage.getItem(setting_key(key));
}

export function loud_failure(string){
  // https://stackoverflow.com/a/10769621/1048464
  console.log(`%c${string}`, `color:red;font-weight:bold;`);
}

export function assert_true(value, desc){
  if (!value){
    loud_failure(`TEST FAILURE: ${desc}`);
    console.log(`Expected true, got ${value}`);
  } else {
    console.log(`Test Passed: ${desc}`);
  }
}

export function assert_false(value, desc){
  if (value){
    loud_failure(`TEST FAILURE: ${desc}`);
    console.log(`Expected false, got ${value}`);
  } else {
    console.log(`Test Passed: ${desc}`);
  }
}

export function assert_equal(lval, rval, desc){
  if(!(JSON.stringify(lval) === JSON.stringify(rval))){
    loud_failure(`Test Failure: ${desc}`);
    console.log(`Expected`);
    console.log(lval);
    console.log(`To equal`);
    console.log(rval);
  } else {
    console.log(`Test Passed: ${desc}`);
  }
}

export function update_settings(){
  console.log("update settings");
  Object.keys(DEFAULT_SETTINGS).forEach( (key) => {
    _.settings[key] = get_setting(key);
  })
  console.log(_.settings);
}

export function restore_default_settings(){
  console.log("restore_default_settings");
  Object.keys(DEFAULT_SETTINGS).forEach( (key) => {
    set_setting(key, DEFAULT_SETTINGS[key]);
  })
}

export function dict_foreach(dict, callback){
  Object.keys(dict).forEach( (key) => {
    for(let i = 0; i < dict[key]; i ++){
      callback(key);
    }
  });
}

export function dict_add(dict, type, amount){
  /* Got tired of rewriting this code.
   * Useful for cargo, etc.
   */
  if(type in dict){
    dict[type] += amount;
  } else {
    dict[type] = amount;
  }
}

export function dict_subtract(dict, type, amount){
  /* Similar to dict add.
   * TODO: Raise an exception if result < 0?
   * Returns false on a subtract that would go below zero
   */
  if(type in dict){
    dict[type] -= amount;
  } else {
    console.log(`Dict subtract tried to take ${type} away but none existed`);
    return false;
  }
  if(dict[type] === 0){
    delete dict[type];
  } else if (dict[type] < 0){
    console.log(`Dict subtract went below zero: ${type} === ${amount}`);
    return false;
  }

  return true;
}

export function utils_unit_tests(){
  // Test local storage for settings
  set_setting("foo", "bar");
  assert_true(get_setting("foo") === "bar",
    "Can save settings in local storage");
  clear_setting("foo");

  assert_equal(
    polar_from_rect({x: 1, y: 1}),
    {
      angle: Math.PI * 1.25,
      magnitude: Math.sqrt(2),
    },
    "polar from rect works properly",
  );
  
  let dict = {};
  dict_add(dict, "foo", 1);
  assert_equal(dict, {"foo": 1}, "dict add creates a new key");
  dict_add(dict, "foo", 1);
  assert_equal(dict, {"foo": 2}, "dict_add adds to existing key");
}

