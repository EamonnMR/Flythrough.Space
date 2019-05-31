import { weapon_factory } from "./weapon.js";

const ARC = Math.PI * 2;

export function distance(l_pos, r_pos){
  return Math.sqrt(
      Math.pow(l_pos.x - r_pos.x, 2) +
      Math.pow(l_pos.y - r_pos.y, 2)
  );
};

export function apply_upgrade(ship, upgrade, data){
  for(let key of Object.keys(upgrade)){
    if(key === "weapon"){
      let weapon = upgrade.weapon;
      ship.weapons.push( weapon_factory(weapon, data));
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

export function apply_upgrades(ship, upgrades, data){
  ship.weapons = [];
  for(let key of Object.keys(upgrades)){
    for(let i = 0; i < upgrades[key]; i++){
      let upgrade = data.upgrades[key];
      if(upgrade === undefined){
        console.log("Invalid Upgrade: " + key);
      } else {
        apply_upgrade(ship, data.upgrades[key], data);
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

let url_params = new URLSearchParams(window.location.search);

let all_cheats_enabled = url_params.has("all_cheats");

export function is_cheat_enabled(cheat){
  return all_cheats_enabled || url_params.has(cheat);
}

