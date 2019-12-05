import { distance } from "./util.js";

const HYPERJUMP_COST = 1.0;
const HYPERJUMP_DISTANCE = 100;

// TODO: Cool special effects function? (or in graphics.js?)

export function has_sufficient_fuel(entity){
  return 'fuel' in entity && entity.fuel >= HYPERJUMP_COST;
}

export function has_sufficient_distance(entity){
  // TODO: Add an attribute to entities that allows you to change distance
  // TODO: Check system for massive objects?
  return distance({x:0, y:0}, entity.position) > HYPERJUMP_DISTANCE;
}
