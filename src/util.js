/* The idea here was to pull out re-used functions,
 * but the only one used that frequently was distance.
 */

export function distance(l_pos, r_pos){
  return Math.sqrt(
      Math.pow(l_pos.x - r_pos.x, 2) +
      Math.pow(l_pos.y - r_pos.y, 2)
  );
};

