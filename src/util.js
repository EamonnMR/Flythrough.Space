import { Weapon } from "./weapon.js";

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
