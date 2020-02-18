// Plan for carried fighters:
// Key variable: Launch_cooldown
// Carried fighters are tracked as upgrades and added to ships
// upon spawn like weapons are, launching consumes like ammo.
//
// (check carried ships upon leaving a system!!!)

import {fighterFactory} from "./entities.js";
import {
  assert_true,
  assert_false,
  assert_equal,
  CARRIED_PREFIX,
  distance,
} from "./util.js";
import { _ } from "./singletons.js";

const RECALL_DIST = 10;

export function fighterLaunchSystem(entMan){
  for(let entity of entMan.get_with(
    ["launching_fighters", "fighter_launch_cooldown_divisor"]
  )){
    if (entity.launching_fighters
      && ! entity.fighter_launch_timer
    ){
      if (launch_fighter(entity)){
        entity.fighter_launch_timer = get_cooldown(
          entity.fighter_launch_per_second
        );
      }
    } else {
      entity.fighter_launch_timer -= entMan.delta_time;
      if(entity.fighter_launch_timer <= 0){
        entity.fighter_launch_timer = 0;
      }
    }
  }
}


export function fighterDockSystem(entMan){
  for(let entity of entMan.get_with(
    ["mothership", "position"]
  )){
    let mothership = entMan.get(entity.mothership);
    if(
      mothership &&
      mothership.order &&
      mothership.order == "recall" &&
      distance(entity.position, mothership.position) < RECALL_DIST){
      dock(mothership, entity)
    }
  }
}

function dock(mothership, entity){
  push_fighter(mothership.upgrades, entity.type);
  entity.remove = true;
}

function launch_fighter(mothership){
  let type = pop_fighter(mothership.upgrades);
  // TODO: Customization goes here
  let ship_dat = _.data.ships[type];
  if(type){
    _.entities.insert(fighterFactory(ship_dat, mothership));
    return true;
  }
  return false;
}

function get_cooldown(divisor){
  return 1000 / divisor
}

function pop_fighter(upgrades){
  /* Takes an upgrades object like {a: 1, b: 3, c: 4}
   * Mutates the dict to be like: {a: 1, b: 2, c: 4}
   * and returns 'b'. Returns undefined if the dict is empty.
   * If a key would be zero, delete it.
   */
  // TODO: Stable ordering? Does this even work at all?
  let keys = get_fighter_keys(upgrades);
  if( keys.length == 0 ){
    return undefined;
  }

  let key = keys[0];
  let type = key.replace(CARRIED_PREFIX, "");

  upgrades[key] -= 1;
  if (upgrades[key] <= 0){
    delete upgrades[key];
  }
  return type;
}

function push_fighter(upgrades, fighter_type){
  let key = CARRIED_PREFIX + fighter_type;
  if(key in upgrades){
    upgrades[key] += 1;
  } else {
    upgrades[key] = 1;
  }
}

function get_fighter_keys(upgrades){
  /* Return the list of upgrades that are fighter keys */
  return Object.keys(upgrades).filter(
    key => key.startsWith(CARRIED_PREFIX)
  );
}

function test_pop_fighter(){
  let test_ob = {};
  test_ob[CARRIED_PREFIX + "foo"] = 1;
  test_ob["bar"] = 2;

  const expected_after = {
    bar: 2
  };

  const expected_return = "foo";

  let result = pop_fighter(test_ob);
  
  assert_equal(
    test_ob,
    expected_after,
    "Expected upgrades list to have fighter upgrade removed"
  );

  assert_equal(
    result,
    expected_return,
    "Expected pop fighters to return fighter type"
  );
}

function test_get_fighter_keys(){
  let test_ob = {};
  test_ob[CARRIED_PREFIX + "foo"] = 1;
  test_ob["bar"] = 2

  const expected_object = [
    CARRIED_PREFIX + "foo"
  ];

  assert_equal(
    get_fighter_keys(test_ob),
    expected_object,
    "Get fighter keys should get the right keys"
  );
}

export function fighters_unit_tests(){
  test_get_fighter_keys();
  test_pop_fighter();
}
