export function distance(l_pos, r_pos){
  return Math.sqrt(
      Math.pow(l_pos.x - r_pos.x,) +
      Math.pow(l_pos.y - r_pos.y, 2)
  );
};
