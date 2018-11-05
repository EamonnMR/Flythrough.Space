import { Weapon } from "./weapon.js";

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
      ship.weapons.push( new Weapon(
        weapon.cooldown,
        data.get_sprite_mgr(weapon.sprite),
        weapon.proj,
        weapon.velocity,
        weapon.mesh,
      ));
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

export function point_at(to, startangle, from){
  // This works for turrets but drives me nuts for being weird.
  // TODO: Does this break ship AI?
  // TODO: This could really use some automated tests.
  let dx = from.x - to.x;
  let dy = to.y - from.y;
  
  let cw = (Math.atan2(dy, dx) - startangle) % ARC;
  let ccw = ARC;
  if (cw > 0){
    ccw = ARC - cw;
  } else {
    ccw = ARC + cw;
  }
  // console.log("start: " + startangle);
  // console.log("diff : " + Math.atan2(dx, dy))

  if(Math.abs(cw) < Math.abs(ccw)){
    // console.log("*  CW: " + cw);
    // console.log("  CCW: " + ccw);
    // console.log("  sum: " + (cw + ccw));
    return cw;
  } else {
    // console.log("   CW: " + cw);
    // console.log("* CCW: " + ccw);
    // console.log("  sum: " + (cw + ccw));
    return ccw;
  }
}

export function get_text(){
  let text = new BABYLON.GUI.TextBlock();
  text.color = "White";
  text.text = "";
  text.font_family = "Sans";
  return text;
}
